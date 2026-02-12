/* 
  PROVENTURE CONNECT - BACKEND (Code.gs)
  Copy and paste this entire file into your Google Apps Script editor.
*/

const DB_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

// --- 1. HTTP HANDLERS (The Gateway) ---

function doGet(e) {
    const params = e.parameter;

    // If there's an 'action' param, it's an API request from the frontend
    if (params && params.action) {
        return handleApiRequest(params);
    }

    // Otherwise, serve the SPA (Single Page App)
    return HtmlService.createHtmlOutputFromFile('Index')
        .setTitle('Proventure Connect')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function doPost(e) {
    try {
        // Parse JSON body from frontend
        const data = JSON.parse(e.postData.contents);
        return handleApiRequest(data);
    } catch (error) {
        return responseJSON({ error: "Invalid Request: " + error.message });
    }
}

// --- 2. ROUTING LOGIC ---

function handleApiRequest(data) {
    try {
        let result = {};

        switch (data.action) {
            case 'login':
                result = loginUser(data.email, data.password);
                break;

            case 'getData':
                result = fetchAppData(data.userId, data.role);
                break;

            case 'addTask':
                result = addTask(data.payload);
                break;

            case 'updateStatus':
                result = updateTaskStatus(data.taskId, data.newStatus);
                break;

            case 'deleteTask':
                result = deleteTask(data.taskId);
                break;

            case 'addComment':
                result = addComment(data.payload);
                break;

            case 'editTask':
                result = editTask(data.payload);
                break;

            default:
                throw new Error("Unknown action: " + data.action);
        }

        // If result is null/undefined (functional actions), return success
        if (result === undefined || result === null) result = { status: 'success' };

        return responseJSON(result);

    } catch (err) {
        return responseJSON({ error: err.message });
    }
}

// --- 3. CORE FUNCTIONS ---

function loginUser(email, password) {
    const users = getDataFromSheet('Auth');
    const user = users.find(u => u.Email == email && u.Password == password);
    if (!user) throw new Error('Invalid email or password.');
    delete user.Password;
    return user;
}

function fetchAppData(userId, role) {
    const allProjects = getDataFromSheet('Projects');
    const allTasks = getDataFromSheet('Tasks');
    const allComments = getDataFromSheet('Comments'); // New Sheet

    let projects = [];
    let tasks = [];

    if (role === 'Admin') {
        projects = allProjects;
        tasks = allTasks;
    } else {
        projects = allProjects.filter(p => p.ClientID == userId);

        // --- AUTO-PROVISION DEFAULT PROJECT ---
        // If user has NO projects, create one automatically so they aren't blocked.
        if (projects.length === 0) {
            const projectsSheet = getSheet('Projects');
            const newProjectId = 'PRJ-' + Math.floor(1000 + Math.random() * 9000); // Simple ID
            const newProject = [
                newProjectId,
                'General Project',
                userId,
                new Date(),
                '', // Deadline
                'Active'
            ];
            projectsSheet.appendRow(newProject);

            // Add to local list so it returns immediately
            projects.push({
                ProjectID: newProjectId,
                ProjectName: 'General Project',
                ClientID: userId,
                StartDate: new Date(),
                Deadline: '',
                OverallStatus: 'Active'
            });
        }

        const myProjectIds = projects.map(p => p.ProjectID);
        tasks = allTasks.filter(t => myProjectIds.includes(t.ProjectID));
    }

    // Filter comments for visible tasks
    const taskIds = tasks.map(t => t.TaskID);
    const comments = allComments.filter(c => taskIds.includes(c.TaskID));

    const stats = {
        active: tasks.filter(t => t.Status !== 'Done').length,
        pendingReview: tasks.filter(t => t.Status === 'Review').length,
        completed: tasks.filter(t => t.Status === 'Done').length,
        total: tasks.length
    };

    tasks.reverse();

    return { projects, tasks, comments, stats };
}

function addTask(payload) {
    const sheet = getSheet('Tasks');
    if (!sheet) throw new Error('Tasks sheet not found');

    const taskId = 'TSK-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);

    // Updated Schema: TaskID | ProjectID | TaskName | Description | Status | Priority | Assets_Link | DueDate | CreatedBy
    const newRow = [
        taskId,
        payload.ProjectID,
        payload.TaskName,
        payload.Description,
        'Pending',
        payload.Priority,
        '',
        payload.DueDate, // New Field
        payload.CreatedBy
    ];

    sheet.appendRow(newRow);
    return { status: 'success', taskId: taskId };
}

function editTask(payload) {
    const sheet = getSheet('Tasks');
    const data = sheet.getDataRange().getValues();
    const headers = data[0]; // Assuming headers are in first row

    // Find row index
    const rowIndex = data.findIndex(row => row[0] == payload.TaskID);
    if (rowIndex === -1) throw new Error('Task not found');

    // Map fields to update (excluding immutable ones like CreatedBy/TaskID)
    // Columns (1-based index):
    // 1: TaskID, 2: ProjectID, 3: TaskName, 4: Description, 5: Status, 6: Priority, 7: Assets, 8: DueDate

    const row = rowIndex + 1;

    if (payload.TaskName) sheet.getRange(row, 3).setValue(payload.TaskName);
    if (payload.Description) sheet.getRange(row, 4).setValue(payload.Description);
    if (payload.Priority) sheet.getRange(row, 6).setValue(payload.Priority);
    if (payload.DueDate) sheet.getRange(row, 8).setValue(payload.DueDate);

    return { status: 'success' };
}

function addComment(payload) {
    const sheet = getSheet('Comments'); // Ensure this sheet exists!
    if (!sheet) throw new Error('Comments sheet missing');

    const commentId = 'CMT-' + Date.now();
    // Schema: CommentID | TaskID | Content | AuthorID | Timestamp
    sheet.appendRow([commentId, payload.taskId, payload.content, payload.authorId, new Date().toISOString()]);

    return { status: 'success' };
}

function updateTaskStatus(taskId, newStatus) {
    const sheet = getSheet('Tasks');
    const data = sheet.getDataRange().getValues();

    // Find row index (data is 0-indexed, but sheet rows are 1-indexed)
    // We skip header (row 0), so loop starts. But simple findIndex works if we encompass header.

    // Assuming TaskID is Column 1 (index 0)
    const rowIndex = data.findIndex(row => row[0] == taskId);

    if (rowIndex === -1) throw new Error('Task not found');

    // Status is Column 5 (index 4) -> Row is rowIndex + 1
    sheet.getRange(rowIndex + 1, 5).setValue(newStatus);
    return { status: 'updated' };
}

function deleteTask(taskId) {
    const sheet = getSheet('Tasks');
    const data = sheet.getDataRange().getValues();
    const rowIndex = data.findIndex(row => row[0] == taskId);

    if (rowIndex === -1) throw new Error('Task not found');

    sheet.deleteRow(rowIndex + 1);
    return { status: 'deleted' };
}

// --- 4. UTILITIES ---

function getSheet(name) {
    return SpreadsheetApp.openById(DB_ID).getSheetByName(name);
}

function getDataFromSheet(sheetName) {
    const sheet = getSheet(sheetName);
    if (!sheet) return [];

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return []; // Only header or empty

    const headers = data.shift(); // Remove first row (headers)

    // Convert array of arrays to array of objects
    return data.map(row => {
        let obj = {};
        headers.forEach((header, index) => {
            // Clean headers if needed (trim) to avoid key errors
            const safeHeader = header.toString().trim();
            obj[safeHeader] = row[index];
        });
        return obj;
    });
}

function responseJSON(content) {
    return ContentService.createTextOutput(JSON.stringify(content))
        .setMimeType(ContentService.MimeType.JSON);
}

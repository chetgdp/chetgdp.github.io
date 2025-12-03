/*
* app.js
*/

import init, { 
    get_header_html,
    get_footer_html,
    get_about_html,
    get_post,
    //get_menu_html,
    get_menu_html_sorted,
} from './pkg/blog.js';

const appContainer = document.getElementById('app-container');

// renders the main post list/navigation menu.
/*
function loadPostList() {
    //const postTree = window.wasm_module.get_post_tree();
    //appContainer.innerHTML = `<nav><h1>My Blog</h1>${buildNavHtmlRecursive(postTree)}</nav>`;
    //appContainer.innerHTML = `<div class="menu">${menu}</div>`;
    const about = window.wasm_module.get_about_html();
    const menu = window.wasm_module.get_menu_html();
    const html = `
<div class="about">${about}</div>
<div class="menu">${menu}</div>
    `;
    return html;
}
*/

// Claude from here 
function loadPostList(sortOrder = 'date-oldest') {
    let menu;
    switch(sortOrder) {
        case 'alphabetical':
            menu = window.wasm_module.get_menu_html_sorted(0);
            break;
        case 'date-newest':
            menu = window.wasm_module.get_menu_html_sorted(1);
            break;
        case 'date-oldest':
            menu = window.wasm_module.get_menu_html_sorted(2);
            break;
    }
    
    const about = window.wasm_module.get_about_html();
    const html = `
        <div class="about">${about}</div>
        <div class="sort-controls">
            <button data-sort="alphabetical" onclick="updateMenuSort('alphabetical')">A-Z</button>
            <button data-sort="date-newest" onclick="updateMenuSort('date-newest')">Newest</button>
            <button data-sort="date-oldest" onclick="updateMenuSort('date-oldest')" class="active">Oldest</button>
        </div>
        <div class="menu">${menu}</div>
    `;
    return html;
}

// Only update the menu portion
function updateMenuSort(sortOrder) {
    let menu;
    switch(sortOrder) {
        case 'alphabetical':
            console.log("test1");
            menu = window.wasm_module.get_menu_html_sorted(0);
            break;
        case 'date-newest':
            console.log("test2");
            menu = window.wasm_module.get_menu_html_sorted(1);
            break;
        case 'date-oldest':
            console.log("test3");
            menu = window.wasm_module.get_menu_html_sorted(2);
            break;
    }
    
    // Find and update just the menu div
    const menuDiv = document.querySelector('.menu');
    if (menuDiv) {
        menuDiv.innerHTML = menu;
    }

    updateActiveButton(sortOrder);
}

function updateActiveButton(activeSortOrder) {
    const buttons = document.querySelectorAll('.sort-controls button');
    buttons.forEach(button => {
        button.classList.remove('active');
        if (button.dataset.sort === activeSortOrder) {
            button.classList.add('active');
        }
    });
}

window.updateMenuSort = updateMenuSort;
// to here :p

// The main "router", reads the URL hash and renders the correct view
function handleLocationChange() {
    // set empty, then operate
    let html = "";
    
    // our navbar always visible at the top
    html = window.wasm_module.get_header_html();
    
    // from "#/subdir/post.md" to "subdir/post.md"
    let main = "";
    const path = window.location.hash.substring(2);
    if (path) {
        console.log(path);
        const htmlOutput = window.wasm_module.get_post(path);
        if (htmlOutput) {
            main += `<div id="post">${htmlOutput}</div>`;
        } else {
            main += `<h2>Error: Post not found at "${path}"</h2>`;
        }
    } else {
        main += loadPostList();
    }
    html += `<main>${main}</main>`;

    // footer should always be visible at the bottom
    html += window.wasm_module.get_footer_html();

    appContainer.innerHTML = html;
}

// --- Event Listeners and Initialization ---

// Intercept HTMX requests before they happen.
document.body.addEventListener('htmx:beforeRequest', function(event) {
    const url = event.detail.path;
    if (url.startsWith('wasm://')) {
        // This is our custom protocol. Handle it and stop HTMX from proceeding.
        event.preventDefault();
        handleLocationChange(); // The router already has all the logic we need!
    }
});

// Main async function to initialize the application.
async function run() {
    // Initialize the WASM module
    await init();

    // Expose WASM functions globally for easy access
    window.wasm_module = { 
        get_header_html,
        get_footer_html,
        get_about_html,
        get_post,
        //get_menu_html,
        get_menu_html_sorted,
    };

    // Listen for back/forward button clicks
    window.addEventListener('popstate', handleLocationChange);

    // Render the initial view based on the current URL
    handleLocationChange();
}

// Start the application
run();


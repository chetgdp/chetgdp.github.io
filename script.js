function getMarkdown(i) {
    let html_output = window.wasm_module.render_markdown(i);
    let target_div = document.getElementById('content-target');

    if(html_output) {
        target_div.innerHTML = `<a href="#" hx-on:click="window.loadPostList()">home</a>`;
        target_div.innerHTML += html_output;
        target_div.innerHTML += `<a href="#" onclick="loadPostList()">home</a>`;
    } else {
        target_div.innerHTML = `<h2>Error: Post not found: %{filename}</h2>`;
    }

    htmx.process(target_div);
}

function buildNavHtmlRecursive(nodeAsMap) {
    // convert the Map for the current level into a plain Object.
    const nodeAsObject = Object.fromEntries(nodeAsMap);

    let html = '<ul>';

    const entries = Object.entries(nodeAsObject).sort(([nameA, nodeA], [nameB, nodeB]) => {
        // a Map represents a directory, an Object with 'path' is a file
        const isDirA = nodeA instanceof Map;
        const isDirB = nodeB instanceof Map;
        if (isDirA && !isDirB) return -1;
        if (!isDirA && isDirB) return 1;
        return nameA.localeCompare(nameB);
    });

    for (const [name, childNode] of entries) {
        if (childNode instanceof Map) { // It's a directory (a Map)
            const dirName = name.replace(/-/g, ' ');
            html += `<li><strong>${dirName}</strong>`;
            // Recurse with the child Map. The next call will handle the conversion.
            html += buildNavHtmlRecursive(childNode);
            html += '</li>';
        } else { // It's a file (an Object)
            const post = childNode;
            const escapedPath = post.path.replace(/'/g, "\\'");
            html += `<li><a href="#${escapedPath}" onclick="getMarkdown('${escapedPath}')">${post.title}</a></li>`;
        }
    }

    html += '</ul>';
    return html;
}

function loadPostList() { 
    console.log("test");
    try {
        // Get the top-level Map from WASM
        const postTreeMap = window.wasm_module.get_post_tree();
        const nav = document.getElementById('content-target');

        // Kick off the recursion with the top-level Map.
        // No conversion needed here anymore.
        nav.innerHTML = buildNavHtmlRecursive(postTreeMap);

    } catch (e) {
        console.error("Error loading post list:", e);
        const nav = document.getElementById('content-target');
        nav.innerHTML = "<p>Could not load posts</p>";
    }
}

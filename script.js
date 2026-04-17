const delay = 800;
let dfsRunning = false;
let bfsRunning = false;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function explain(msg) {
    document.getElementById("explainText").innerHTML = msg;
}

function resetPanel(prefix) {
    document.querySelectorAll(`#${prefix} .node`).forEach(n =>
        n.classList.remove("active", "visited")
    );
    document.querySelectorAll(`#${prefix} .edge`).forEach(e =>
        e.style.opacity = 0
    );
}

/* ==============================
      GRAPH
============================== */

const graph = {
    A: ["B", "C"],
    B: ["D", "E"],
    C: ["F"],
    D: [], E: [], F: []
};

/* ==============================
      DFS 
============================== */

let dfsActions = [];
let dfsIndex = 0;

function showDFSState() {
    document.getElementById("dfsState").style.display = "block";
}

function hideDFSState() {
    document.getElementById("dfsState").style.display = "none";
}

function updateStackDisplay(stack) {
    const container = document.getElementById("stackDisplay");
    container.innerHTML = "";

    stack.forEach(item => {
        const div = document.createElement("div");
        div.className = "stackItem";
        div.innerText = item;
        container.appendChild(div);
    });
}

function buildDFS(node, parent = null, stack = []) {

    let newStack = [...stack, node];

    dfsActions.push(() => {
        document.getElementById(`dfs-${node}`).classList.add("active");
        explain(parent ? `DFS: ${parent} → ${node}` : `DFS: Start at ${node}`);
        updateStackDisplay(newStack);
    });

    if (parent) {
        dfsActions.push(() => {
            document.getElementById(`dfs-${parent}-${node}`).style.opacity = 1;
        });
    }

    for (const child of graph[node]) {
        dfsActions.push(() => {
            explain(`DFS: From ${node}, go to ${child}`);
            updateStackDisplay(newStack);
        });

        buildDFS(child, node, newStack);
    }

    let afterPop = [...stack];

    dfsActions.push(() => {
        let el = document.getElementById(`dfs-${node}`);
        el.classList.remove("active");
        el.classList.add("visited");

        explain(`DFS: Backtrack from ${node}`);
        updateStackDisplay(afterPop);

        
    });

}

function resetDFS() {
    dfsRunning = false;
    dfsActions = [];
    dfsIndex = 0;

    resetPanel("dfsGraph");
    hideDFSState();
    updateStackDisplay([]);

    buildDFS("A");

    
    dfsActions.push(() => {
        document.getElementById("dfsState").style.display = "none";

        const explainBox = document.getElementById("explainText");
        explainBox.classList.add("centerSummary");

        explain(
            "  <strong> Summary: </strong> DFS explores as far as possible along one path " +
            "before backtracking, using a stack (or recursion)."
        );
    });

}

async function playDFS() {
    dfsRunning = true;

    while (dfsIndex < dfsActions.length && dfsRunning) {
        dfsActions[dfsIndex]();
        dfsIndex++;
        await sleep(delay);
    }

    dfsRunning = false;
}

function stepDFS() {
    if (dfsIndex < dfsActions.length) {
        dfsActions[dfsIndex]();
        dfsIndex++;
    }
}

/* ==============================
      BFS 
============================== */


function markQueueHead(node) {
    document.querySelectorAll(".node.queue-head")
        .forEach(n => n.classList.remove("queue-head"));

    if (node) {
        document.getElementById(`bfs-${node}`)
            .classList.add("queue-head");
    }
}

let bfsSteps = [];
let bfsIndex = 0;

function buildBFS() {
    bfsSteps = [];
    bfsIndex = 0;

    let queue = [];
    let visited = [];

    // STEP 0: enqueue A
    queue.push("A");

    bfsSteps.push(() => {
        explain("BFS: Enqueue A (start)");

        // mark A as in queue
        document.getElementById("bfs-A").classList.add("inQueue");

        // updateQueue([...queue]);
        // updateQueue(queue.length > 0 ? [...queue] : [node]);
        
        const visualQueue =queue.length > 0 ? [...queue] : [];
        updateQueue(visualQueue);

        markQueueHead(queue[0]); // A is head → yellow in graph

        updateVisited([...visited]);
    });

    while (queue.length > 0) {

    // Snapshot before mutation
    const dequeueSnapshot = [...queue];
    const node = queue.shift();

    // DEQUEUE (peach)
    bfsSteps.push(() => {
        explain(`BFS: Dequeue ${node} — the next node to be visited.`);
        
        const el = document.getElementById(`bfs-${node}`);

        // show node is being processed (yellow)
        // el.classList.add("active");
        // el.classList.add("dequeued");   // peach, matches queue
        // remove head state…
        el.classList.remove("queue-head");

        // …and mark as dequeued (peach)
        el.classList.add("dequeued");


        updateQueue(dequeueSnapshot, node);
    });

    // After dequeue (yellow)
    const remainingSnapshot = [...queue];
    bfsSteps.push(() => {
        updateQueue(remainingSnapshot);
        markQueueHead(remainingSnapshot[0]); // ✅ next head → yellow
    });

    if (!visited.includes(node)) {

        // VISIT (mutation delayed!)
        bfsSteps.push(() => {

               const el = document.getElementById(`bfs-${node}`);

            //    el.classList.remove("active");
                el.classList.remove("dequeued"); // no longer being dequeued

               // remove queue colouring first
               el.classList.remove("inQueue");

               //  mark as visited (blue)
              el.classList.add("visited");

              visited.push(node);
              updateVisited([...visited]);

        });

        // ENQUEUE children
        for (const child of graph[node]) {
            if (!visited.includes(child) && !queue.includes(child)) {
                queue.push(child);
                const enqueueSnapshot = [...queue];

                bfsSteps.push(() => {
                    explain(`BFS: Enqueue ${child} — discovered from ${node}.`);
                    document
                        .getElementById(`bfs-${node}-${child}`)
                        .style.opacity = 1;
                    document
                        .getElementById(`bfs-${child}`)
                        .classList.add("inQueue");
                    updateQueue(enqueueSnapshot);
                });
            }
        }
    }
}

    bfsSteps.push(() => {
        explain("BFS complete — all nodes visited");
       });

       

    bfsSteps.push(() => {
        // updateQueue([]); 
        // Clear visited display
        // updateVisited([]);
        
       // Hide the entire queue section (label + boxes)
       document.getElementById("queueContainer").style.display = "none";

       // Clear visited display 
       updateVisited([]);

        explain("<strong>Summary: </strong> BFS explores the graph level by level using a queue.  Nodes are visited in the order they are discovered.");
    });
}



/* RESET */
function resetBFS() {
    bfsRunning = false;
    bfsSteps = [];
    bfsIndex = 0;

    resetPanel("bfsGraph");

    
    // CLEAR ALL BFS NODE STATES
    document.querySelectorAll("#bfsGraph .node").forEach(node => {
        node.classList.remove(
            "inQueue",
            "queue-head",
            "dequeued",
            "visited",
            "active"
        );
    })


    updateQueue([]);
    updateVisited([]);

    buildBFS();
}

async function playBFS() {
    bfsRunning = true;

    while (bfsIndex < bfsSteps.length && bfsRunning) {
        bfsSteps[bfsIndex]();
        bfsIndex++;
        await sleep(delay);
    }

    bfsRunning = false;
}

function stepBFS() {
    if (bfsIndex < bfsSteps.length) {
        bfsSteps[bfsIndex]();
        bfsIndex++;
    }
}

/* ==============================
      BUTTONS
============================== */

document.getElementById("playDFS").onclick = async () => {
    clearMiddle();
    resetDFS();
    showDFSState();
    await playDFS();
};

document.getElementById("stepDFS").onclick = () => {
    if (dfsIndex === 0) {
        clearMiddle();
        resetDFS();
        showDFSState();
    }
    stepDFS();
};

document.getElementById("resetDFS").onclick = () => {
    clearMiddle();     // clears summary
    resetDFS();
};


document.getElementById("playBFS").onclick = async () => {
    // clearMiddle();
    showBFSState();
    resetBFS();
    await playBFS();
};

document.getElementById("stepBFS").onclick = () => {
    if (bfsIndex === 0) {
        clearMiddle();
        showBFSState();
        resetBFS();
    }
    stepBFS();
};

document.getElementById("resetBFS").onclick = () => {
    clearMiddle();     // clears summary
    resetBFS();
};


document.getElementById("closeBtn").onclick = () => {
    window.open('', '_self');
    window.close();
};

function showBFSState() {
    document.getElementById("bfsState").style.display = "block";
}

function clearMiddle() {
    // document.getElementById("explainText").innerText = "";
    
    const explainBox = document.getElementById("explainText");
    explainBox.innerText = "";
    explainBox.classList.remove("centerSummary"); 

    document.getElementById("dfsState").style.display = "none";
    document.getElementById("bfsState").style.display = "none";

    document.getElementById("stackDisplay").innerHTML = "";
    document.getElementById("queueDisplay").innerHTML = "";
    document.getElementById("visitedDisplay").innerText = "";
}

/* ==============================
      UI RENDERING
============================== */
function updateQueue(queue, dequeued = null) {
    const container = document.getElementById("queueContainer");
    const box = document.getElementById("queueDisplay");

    box.innerHTML = "";

    if (queue.length === 0) {
        container.style.display = "none";
        return;
    }

    container.style.display = "block";

    queue.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "queueItem";
        div.innerText = item;

        // default
        div.style.background = "lightgreen";

        // head of queue
        if (index === 0) {
            div.style.background = "yellow";
        }

        // dequeued highlight
        if (item === dequeued) {
            div.style.background = "#FFDAB9";
            div.style.opacity = "0.7";
        }

        box.appendChild(div);
    });
}

// function updateQueue(queue, dequeued = null) {
//     const container = document.getElementById("queueDisplay");
//     container.innerHTML = "";

    
//  // Hide entire queue section if empty
//     if (queue.length === 0) {
//         container.style.display = "none";
//         return;
//     }

//     // Show queue + title
//     container.style.display = "block";


//     queue.forEach((item, index) => {
//         const div = document.createElement("div");
//         div.className = "queueItem";
//         div.innerText = item;

//         // default = light green
//         div.style.background = "lightgreen";

//         // front = yellow
//         if (index === 0) {
//             div.style.background = "yellow";
//         }

//         // dequeued = peach (overrides yellow)
//         if (item === dequeued) {
//             div.style.background = "#FFDAB9";
//             div.style.opacity = "0.7";
//         }

//         container.appendChild(div);
//     });
// }

function updateVisited(visited) {
    const container = document.getElementById("visitedContainer");
    const el = document.getElementById("visitedDisplay");

    if (visited.length === 0) {
        container.style.display = "none"; // ✅ hides "Visited:" label as well
    } else {
        container.style.display = "block";
        el.innerText = `[${visited.join(", ")}]`;
    }
}


// function updateVisited(visited) {
//     // document.getElementById("visitedDisplay").innerText =
//     //     `[${visited.join(", ")}]`;

    
// const el = document.getElementById("visitedDisplay");

//     if (visited.length === 0) {
//         el.innerText = "";
//         el.style.display = "none";   // Hide visisited array  completely
//     } else {
//         el.style.display = "block";  // Display visited array  during BFS
//         el.innerText = `[${visited.join(", ")}]`;
//     }

// }


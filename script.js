document.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById("commandInput");
    const output = document.getElementById("output");
    const terminal = document.getElementById("terminal-container");
    const hint = document.getElementById("autocompleteHint");
    const mirror = document.getElementById("inputMirror");

    let commandHistory = [];
    let historyIndex = -1;

    // ── REPLACE with your actual Google Drive public folder link ──
    const CERTIFICATES_URL = "https://drive.google.com/drive/folders/114Y9qzxuSTNQTsG4r7gBGmiB9QXaxEGQ?usp=sharing";

    const helpMessage = `
    <b>💻 System Commands:</b><br>
    <b>help or h</b>      - Show available commands<br>
    <b>clear or cls</b>   - Clear the terminal<br>
    <br>
    <b>👤 Personal Information:</b><br>
    <b>skills</b>         - Show my technical skills<br>
    <b>projects</b>       - List my featured projects<br>
    <b>certificates</b>   - View my certificates (opens Google Drive)<br>
    <b>contact or c</b>   - Show all contact details<br>
    <br>
    <b>🌐 Online Profiles:</b><br>
    <b>linkedin or ln</b> - Open my LinkedIn<br>
    <b>github or gh</b>   - Open my GitHub<br>
    <br>
    <b>📄 Documents:</b><br>
    <b>resume or r</b>    - Download my resume<br>
    `;

    const commands = {
        help: helpMessage,

        contact: () => {
            return `
        <b>📬 Contact Me:</b><br><br>
        <b>Name &nbsp;&nbsp;&nbsp;&nbsp;:</b> Tejas Pandav<br>
        <b>Phone &nbsp;&nbsp;&nbsp;:</b> <a href="tel:+91 XXXXX XXXXX" class="custom-link">+91 9021451291</a><br>
        <b>Email &nbsp;&nbsp;&nbsp;:</b> <a href="mailto:tejaspandav248@gmail.com" class="custom-link">tejaspandav248@gmail.com</a><br>
        <b>LinkedIn :</b> <a href="https://www.linkedin.com/in/tejas-pandav-soc/" target="_blank" class="custom-link">linkedin.com/tejas-pandav-soc/</a><br>
        <b>GitHub &nbsp;&nbsp;:</b> <a href="https://github.com/Tejas-SOC" target="_blank" class="custom-link">Tejas-SOC</a><br>
            `;
        },

        github: () => {
            window.open("https://github.com/Tejas-SOC", "_blank");
            return `Opening <a href="https://github.com/Tejas-SOC" target="_blank" class="custom-link">tejas248</a>...`;
        },

        linkedin: () => {
            window.open("https://www.linkedin.com/in/tejas-pandav-soc/", "_blank");
            return `Opening <a href="https://www.linkedin.com/in/tejas-pandav-soc/" target="_blank" class="custom-link">linkedin.com/tejas-pandav-soc/</a>...`;
        },

        // ── NEW: certificates command ──
        certificates: () => {
            window.open(CERTIFICATES_URL, "_blank");
            return `Opening <a href="${CERTIFICATES_URL}" target="_blank" class="custom-link">certificates on Google Drive</a>...`;
        },



        projects: `
        <b>Featured Projects:</b><br><br>

        • <b>Home SIEM Lab using Wazuh</b><br>
        &nbsp;&nbsp;Built a SOC home lab environment using Wazuh SIEM for <br> &nbsp;&nbsp;real-time monitoring and log analysis.<br>
        &nbsp;&nbsp;Configured Sysmon and Windows Event Logging for endpoint <br> &nbsp;&nbsp;visibility and threat detection.<br>
        &nbsp;&nbsp;Simulated brute-force attacks and port scanning using <br> &nbsp;&nbsp;Kali Linux.<br>
        &nbsp;&nbsp;Analyzed alerts through Wazuh dashboards and <br> &nbsp;&nbsp;ELK visualization.<br>
        &nbsp;&nbsp;Mapped attack behavior using MITRE ATT&CK framework.<br><br>

        &nbsp;&nbsp;<b>Tech Stack:</b><br>
        &nbsp;&nbsp;Kali Linux, Windows 10, VirtualBox<br>
        &nbsp;&nbsp;Wazuh,Sysmon, ELK Stack, <br>
        &nbsp;&nbsp;REST APIs, JSON log parsing<br><br>

       
        • <b>AI-Based Phishing Email Detection System</b><br>
        &nbsp;&nbsp;Developed AI-based phishing email detection using <br> &nbsp;&nbsp;Machine Learning and NLP<br>
        &nbsp;&nbsp;Implemented feature extraction including malicious URLs <br> &nbsp;&nbsp;and sender patterns<br>
        &nbsp;&nbsp;Automated phishing analysis workflow to support <br> &nbsp;&nbsp;SOC alert triage<br><br>

        &nbsp;&nbsp;<b>Tech Stack:</b><br>
        &nbsp;&nbsp;Python,Pandas,NLP, <br>
        &nbsp;&nbsp;Scikit-learn / Streamlit.<br><br>

       
        `,


        skills: `
        <b>Core Skills:</b><br>
        • SIEM: Splunk, Microsoft Sentinel, IBM QRadar, Wazuh, Seceon<br>
        • EDR & Security Tools: CrowdStrike, Microsoft Defender,<br>
        &nbsp;&nbsp;SentinelOne, Wireshark, Snort, Metasploit, ClamAV, pfSense<br>
        • Programming: Python, Bash, TypeScript, C, C++<br>
        • Query Languages: SPL, KQL, Lucene <br>
        • Networking: TCP/IP, DNS, HTTP/HTTPS, Firewalls, VPNs, IDS/IPS<br>
        • Systems: Windows, Linux, VMware<br>
        • Cloud: AWS, Azure, IAM<br>
        `,

        resume: () => {
            const link = document.createElement("a");
            link.href = "Tejas Pandav SOC Analyst.pdf";
            link.download = "Tejas Pandav SOC Analyst.pdf";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return "Downloading resume...";
        },

        clear: () => resetTerminal(),
        exit: () => resetTerminal(),
    };

    const aliases = {
        gh: "github",
        ln: "linkedin",
        r: "resume",
        cls: "clear",
        h: "help",
        c: "contact",
        cert: "certificates",
        certs: "certificates",
    };

    const commandList = Object.keys(commands).concat(Object.keys(aliases));

    function processCommand(cmd) {
        cmd = cmd.toLowerCase();
        if (!cmd) return;

        commandHistory.push(cmd);
        historyIndex = commandHistory.length;

        if (aliases[cmd]) cmd = aliases[cmd];
        if (cmd === "clear" || cmd === "exit") return resetTerminal();

        let response =
            typeof commands[cmd] === "function"
                ? commands[cmd]()
                : commands[cmd] || getClosestCommand(cmd);

        appendCommand(cmd, response);
    }

    function resetTerminal() {
        output.innerHTML = `<div class="help-message">Type 'help' to see available commands.</div>`;
        input.value = "";
        hint.textContent = "";
    }

    function appendCommand(command, result) {
        const commandLine = document.createElement("div");
        commandLine.classList.add("command-line");
        commandLine.innerHTML = `<span class="prompt">λ</span> ${command}`;
        output.appendChild(commandLine);

        const resultLine = document.createElement("div");
        resultLine.classList.add("command-result");
        resultLine.innerHTML = result;
        output.appendChild(resultLine);

        input.scrollIntoView({ behavior: "smooth" });
    }

    function getClosestCommand(inputCmd) {
        const closestMatch = commandList.find(cmd => cmd.startsWith(inputCmd));
        return closestMatch
            ? `Did you mean <b>${closestMatch}</b>?`
            : `Command not found: ${inputCmd}`;
    }

    function updateAutocompleteHint() {
        const currentInput = input.value;
        if (!currentInput) {
            hint.textContent = "";
            return;
        }
        const match = commandList.find(cmd => cmd.startsWith(currentInput));
        if (match) {
            hint.textContent = match.slice(currentInput.length);
            mirror.textContent = currentInput;
            hint.style.left = mirror.offsetWidth + "px";
        } else {
            hint.textContent = "";
        }
    }

    function autocompleteCommand() {
        const currentInput = input.value;
        if (!currentInput) return;
        const match = commandList.find(cmd => cmd.startsWith(currentInput));
        if (match) input.value = match;
        hint.textContent = "";
    }

    function createCommandBar() {
        const bar = document.getElementById("command-bar");
        // Row 1: certificates (full width)
        // Row 2: skills,    projects
        // Row 3: resume,    linkedin
        // Row 4: github,    neofetch
        // Row 5: help,      clear
        const order = [
            "certificates",
            "skills", "projects",
            "resume", "linkedin",
            "github", "contact",
            "help", "clear"
        ];
        order.forEach(cmd => {
            const button = document.createElement("button");
            button.textContent = cmd;
            if (cmd === "certificates") button.classList.add("btn-certificates");
            button.addEventListener("click", () => processCommand(cmd));
            bar.appendChild(button);
        });
    }

    input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            processCommand(input.value.trim());
            input.value = "";
            hint.textContent = "";
        } else if (event.key === "ArrowRight" || event.key === "Tab") {
            event.preventDefault();
            autocompleteCommand();
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                input.value = commandHistory[historyIndex];
            }
        } else if (event.key === "ArrowDown") {
            event.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                input.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                input.value = "";
            }
        }
    });

    input.addEventListener("input", updateAutocompleteHint);
    terminal.addEventListener("click", () => input.focus());

    resetTerminal();
    createCommandBar();
});

[中文版](./README.md)

# Concerto of Day and Night - Automated HTML Project Showcase

The core goal of this project is to provide a **simple, fast, and automated** solution for instantly publishing and managing your HTML projects. It is not only an interactive portfolio but also a modern web development paradigm practicing CI/CD, secure API proxying, and AI-powered metadata automation.

## ✨ Project Overview

The centerpiece of this project is a dual-theme interactive website named "Concerto of Day and Night." Its most significant feature is its **automation pipeline**: you only need to push your new HTML project files to the GitHub repository, and all subsequent tasks—such as generating metadata (like project names and descriptions) and updating the project list—are handled automatically by AI and GitHub Actions.

**Key Features:**

- **Automated Project Showcase**: Simply upload an HTML file, and the project will be displayed as a card on the dynamic hub of the main page with no manual configuration required.
- **AI-Driven Metadata**: Uses GitHub Actions to automatically analyze the content of HTML files upon code push and intelligently generates project names, descriptions, and tags using the Gemini API.
- **Dual-Theme UI**: Offers two distinct visual and auditory experiences for day and night.
- **Secure Backend Proxy**: A built-in set of backend APIs securely proxies frontend requests to the Google Gemini API, protecting your API key from being exposed on the client side.

---

## 🛠️ Architecture

This project utilizes a decoupled frontend-backend architecture with a highly automated CI/CD pipeline implemented through GitHub Actions.

### **Frontend**

- **Tech Stack**: Vanilla HTML, CSS, and JavaScript.
- **Core Page**: `public/index.html` is the single entry point, functioning as an SPA-style page that dynamically loads and renders the project list.

### **Backend**

- **Tech Stack**: [Node.js](https://nodejs.org/) with the [Express.js](https://expressjs.com/) framework.
- **Functionality**: Provides static file serving, a project list API (`GET /api/projects`), and a secure Gemini proxy API (`POST /api/proxy/*`).

### **Automation**

- **Tech Stack**: [GitHub Actions](https://github.com/features/actions) with a Node.js script (`scripts/update-projects.js`).
- **Process**: When a `push` event occurs on the `main` branch, the workflow automatically analyzes the changed HTML files, calls the Gemini API to update metadata, and pushes the result back to the repository.

---

## 🚀 Installation Guide

Follow these steps to set up and run the project in your local environment.

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/LayorX/web_temp.git
    cd web_temp
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Set Up Environment Variables**
    Create a file named `.env` in the project root and add your Google Gemini API Key.
    ```
    # .env
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
    ```

4.  **Start the Server**
    ```bash
    npm start
    ```

5.  **Access the Application**
    Open your browser and navigate to `http://localhost:3000`.

---

## ☁️ Deployment

### **Deploying to Zeabur**

This project can be easily deployed to [Zeabur](https://zeabur.com/) with a single click.

1.  **Fork this repository** to your own GitHub account.
2.  In your Zeabur dashboard, click "Add Service" and choose to import from GitHub.
3.  Select the repository you just forked. Zeabur will automatically detect it as a Node.js project and deploy it.
4.  After deployment, go to the "Variables" tab of the service.
5.  Create a new variable named `GEMINI_API_KEY` and paste your Gemini API key into the value field.
6.  Zeabur will automatically redeploy the service to apply the new environment variable. Once done, your project will be accessible via the public URL provided by Zeabur.

---

## 📖 Usage

This project is centered around a "Git-based" automated workflow.

1.  Add or modify your `.html` project file in the `public/show/` directory.
2.  `commit` and `push` your changes to the `main` branch.
3.  Wait a few moments for the GitHub Action to automatically complete the metadata generation and update.
4.  Refresh your website, and the new project or changes will appear on the homepage.

---

## 🤝 Contribution Guide

For details on how to contribute to this project, please see the [CONTRIBUTING.md](./CONTRIBUTING.md) file.

---

## 📄 License

This project is licensed under the MIT License. For details, please see the [LICENSE](./LICENSE) file.
# Automonus-SRE

An Autonomous SRE (Site Reliability Engineering) Multi-Agent Orchestrator designed to detect, analyze, diagnose, and remediate simulated system outages on a boutique microservice simulator.

---

## 🏗️ Project Architecture

The system is split into a Python FastAPI backend and a React + Vite frontend dashboard:

*   **FastAPI Backend ([`main.py`](file:///c:/Users/vijay/Documents/Autmonous%20SRE/main.py))**: Coordinates the SRE workflow and provides APIs to inject chaos and poll metrics/logs. Located at [`main.py`](file:///c:/Users/vijay/Documents/Autmonous%20SRE/main.py).
*   **Multi-Agent Workflow ([`agents/`](file:///c:/Users/vijay/Documents/Autmonous%20SRE/agents))**: Specialized AI SRE agents collaborating in a pipeline. Located at [`agents/`](file:///c:/Users/vijay/Documents/Autmonous%20SRE/agents):
    *   [Monitoring Agent](file:///c:/Users/vijay/Documents/Autmonous%20SRE/agents/monitoring_agent.py): Performs metric anomaly detection.
    *   [Analysis Agent](file:///c:/Users/vijay/Documents/Autmonous%20SRE/agents/analysis_agent.py): Parses error logs and summarizes issues.
    *   [RCA Agent](file:///c:/Users/vijay/Documents/Autmonous%20SRE/agents/rca_agent.py): Diagnoses the root cause.
    *   [Remediation Agent](file:///c:/Users/vijay/Documents/Autmonous%20SRE/agents/remediation_agent.py): Determines the remediation strategy.
    *   [Deployment Agent](file:///c:/Users/vijay/Documents/Autmonous%20SRE/agents/deployment_agent.py): Executes deployment / Kubernetes sync.
*   **Boutique Simulator ([`services/`](file:///c:/Users/vijay/Documents/Autmonous%20SRE/services))**: Simulates traffic, metrics, and logs for boutique microservices. Located at [`services/`](file:///c:/Users/vijay/Documents/Autmonous%20SRE/services).
*   **React Frontend Dashboard ([`dashboard/`](file:///c:/Users/vijay/Documents/Autmonous%20SRE/dashboard))**: A rich real-time UI showing system state, service metrics, agent logs, and chaos injection controls. Located at [`dashboard/`](file:///c:/Users/vijay/Documents/Autmonous%20SRE/dashboard).

---

## 🚀 Getting Started

### 1. Run the Backend
Ensure you have the virtual environment activated:
```powershell
.\venv\Scripts\Activate.ps1
python main.py
```
*The backend API will run on `http://localhost:8000`.*

### 2. Run the Dashboard Frontend
Navigate to the dashboard directory, install dependencies, and start the development server:
```powershell
cd dashboard
npm install
npm run dev
```
*Open `http://localhost:5173` in your browser.*

---

## ⚡ Chaos Engineering & Self-Healing
You can trigger chaos scenarios (e.g. `payment_crash`) from the Dashboard UI or via API:
*   **API Trigger Endpoint**: `POST http://localhost:8000/api/trigger_chaos`
*   Once chaos is injected, the **Autonomous SRE Pipeline** kicks in to detect anomalies, analyze logs, identify the root cause, propose/apply a fix, and recover the system automatically.


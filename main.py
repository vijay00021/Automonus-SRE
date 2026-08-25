# main.py
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio

# Import agents
from agents.monitoring_agent import detect_anomaly
from agents.analysis_agent import analyze_logs
from agents.rca_agent import root_cause
from agents.remediation_agent import determine_remediation
from agents.deployment_agent import execute_deployment
from services.boutique_simulator import simulator

app = FastAPI(title="AutoSRE Agent Backend")

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulator.run(add_log))

# Allow CORS for React dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AgentResponse(BaseModel):
    agent: str
    type: str
    message: str
    timestamp: str

class ChaosScenario(BaseModel):
    scenario: str = "payment_crash"

# In-memory store for demo logs to be polled by frontend
demo_logs = []
current_system_state = "healthy"

def add_log(agent: str, log_type: str, message: str):
    from datetime import datetime
    demo_logs.append({
        "agent": agent,
        "type": log_type,
        "message": message,
        "timestamp": datetime.now().strftime("%I:%M:%S %p")
    })

@app.get("/api/status")
async def get_status():
    """Returns the current overall system status and agent logs."""
    return {
        "system_state": current_system_state,
        "logs": demo_logs
    }

@app.get("/api/metrics")
async def get_metrics():
    """Returns the current metrics for all simulated boutique services."""
    return simulator.get_metrics()

@app.post("/api/reset")
async def reset_demo():
    """Resets the demo state."""
    global demo_logs, current_system_state
    demo_logs = []
    current_system_state = "healthy"
    simulator.reset()
    return {"status": "reset"}

@app.post("/api/trigger_chaos")
async def trigger_chaos(scenario: ChaosScenario, background_tasks: BackgroundTasks):
    """
    Simulates executing Chaos Mesh which triggers the Multi-Agent pipeline.
    """
    global current_system_state
    if current_system_state != "healthy":
        raise HTTPException(status_code=400, detail="System not healthy currently.")
        
    current_system_state = "anomaly"
    
    # Apply scenario to simulator
    simulator.trigger_chaos(scenario.scenario)
    
    add_log("System", "Chaos Mesh", f"CRITICAL FAILURE INJECTED: {scenario.scenario}")
    
    # Run the agent workflow in background
    # Pass the scenario to orchestrate_agents
    background_tasks.add_task(orchestrate_agents, scenario.scenario)
    return {"status": "sequence_started"}

async def orchestrate_agents(scenario: str = "payment_crash"):
    global current_system_state
    
    # Wait to simulate metric scraping delay
    await asyncio.sleep(2)
    
    # 1. Monitoring Agent
    # Fetch real baseline from simulator for the primary affected service
    svc = "paymentservice" if scenario == "payment_crash" else "frontend"
    current_metrics = simulator.get_metrics()[svc]
    monitoring_result = detect_anomaly({
        "latency": current_metrics["latency_p95_ms"], 
        "errors": current_metrics["error_rate"],
        "service": svc
    })
    
    add_log("Monitoring", "Alert", monitoring_result["message"])
    current_system_state = "rca"
    
    await asyncio.sleep(2.5)
    
    # 2. Analysis Agent
    pseudo_logs = f"ERROR: {svc} failure detected in logs"
    analysis_result = analyze_logs(pseudo_logs)
    add_log("Analysis", "Log parsing", analysis_result["summary"])
    
    await asyncio.sleep(2.5)
    
    # 3. RCA Agent
    rca_result = root_cause(analysis_result["summary"], svc)
    add_log("RCA", "Root Cause", rca_result["root_cause"])
    current_system_state = "remediation"
    
    await asyncio.sleep(2.5)
    
    # 4. Remediation Agent
    remediation_plan = determine_remediation(rca_result)
    add_log("Remediation", "Action", remediation_plan["message"])
    
    await asyncio.sleep(2.5)
    
    # 5. Deployment Agent
    deploy_result = execute_deployment(remediation_plan)
    add_log("Deployment", "K8s Sync", deploy_result["message"])
    
    # Heal the system
    simulator.reset()
    current_system_state = "recovering"
    
    await asyncio.sleep(4)
    
    # Recovery
    add_log("System", "Recovery", "System returned to normal operational baseline.")
    current_system_state = "healthy"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

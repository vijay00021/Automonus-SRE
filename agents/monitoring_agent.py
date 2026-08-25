# agents/monitoring_agent.py
import time
import random

def detect_anomaly(metrics_data):
    """
    Mock Monitoring Agent that 'analyzes' incoming CPU/latency metrics.
    In a real system, this would scrape Prometheus.
    """
    prompt_thought = "Thinking: I am monitoring the logs and metrics. Checking latency bounds..."
    
    # Analyze the simulated input
    if metrics_data.get('latency', 0) > 100 or metrics_data.get('errors', 0) > 2:
        return {
            "status": "anomaly_detected",
            "message": "Anomaly detected! High error rate on payment /checkout endpoint.",
            "thought_process": prompt_thought
        }
    
    return {
        "status": "healthy",
        "message": "System operates within normal parameters.",
        "thought_process": prompt_thought
    }

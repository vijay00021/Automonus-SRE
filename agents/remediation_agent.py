# agents/remediation_agent.py

def determine_remediation(rca_output):
    """
    Remediation Agent determines the fix based on RCA.
    """
    issue = rca_output.get("root_cause", "").lower()
    
    if "pod crash" in issue or "oom" in issue:
        return {
            "action": "restart_pod",
            "target": "deployment/payment-db",
            "message": "Executing Auto-Remediation: Restarting DB pod..."
        }
    
    if "traffic" in issue or "latency" in issue:
        return {
            "action": "scale_deployment",
            "target": "deployment/payment",
            "replicas": 5,
            "message": "Executing Auto-Remediation: Scaling payment service..."
        }
        
    return {
        "action": "alert_only",
        "message": "Issue unknown. Paging human-in-the-loop."
    }

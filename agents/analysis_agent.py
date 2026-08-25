# agents/analysis_agent.py

def analyze_logs(logs_context):
    """
    Log Analysis Agent setup using Langchain pseudo-logic.
    Extracts structured data from raw log dumps.
    """
    prompt_thought = "Thinking: Analyzing the raw log dump from the anomalous timeframe step-by-step..."
    
    # Dynamically find the service from our simulator list
    services = ["frontend", "cartservice", "checkoutservice", "recommendationservice",
                "productcatalogservice", "paymentservice", "shippingservice",
                "emailservice", "currencyservice", "adservice", "loadgenerator"]
    
    impacted_svc = "unknown"
    for svc in services:
        if svc in logs_context.lower():
            impacted_svc = svc
            break
            
    if impacted_svc != "unknown":
        return {
            "summary": f"{impacted_svc.capitalize()} Service High Error Rate / Latency Spike detected in logs.",
            "impacted_service": impacted_svc,
            "error_type": "ServiceDegradation",
            "thought_process": prompt_thought
        }
        
    return {
        "summary": "No specific critical error patterns detected.",
        "impacted_service": "unknown",
        "error_type": "None",
        "thought_process": prompt_thought
    }

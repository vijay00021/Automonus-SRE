# agents/rca_agent.py

def root_cause(log_summary, service):
    """
    RCA Agent utilizing Chain-of-Thought style pseudo-reasoning.
    Finds the root cause given structured logs.
    """
    prompt = f"""
    Think step-by-step:
    1. What failed? The {service} failed due to severe degradation.
    2. What triggered it? Analysis of logs indicates a spike in traffic or pod crash.
    3. Dependency issues? Database or internal connector might be failing.
    """
    
    return {
        "root_cause": f"Pod failure or high latency in {service} component.",
        "chain_of_thought": prompt,
        "severity": "CRITICAL"
    }

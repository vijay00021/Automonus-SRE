import asyncio
import random
from datetime import datetime

SERVICES = [
    "frontend", "cartservice", "checkoutservice", "recommendationservice",
    "productcatalogservice", "paymentservice", "shippingservice",
    "emailservice", "currencyservice", "adservice", "loadgenerator"
]

class BoutiqueSimulator:
    def __init__(self):
        self.metrics = {
            svc: {"requests_per_sec": 0, "error_rate": 0.0, "latency_p95_ms": 0}
            for svc in SERVICES
        }
        self.chaos_scenario = None
        self.is_running = False

    def trigger_chaos(self, scenario):
        self.chaos_scenario = scenario

    def reset(self):
        self.chaos_scenario = None

    def get_metrics(self):
        return self.metrics

    def generate_baseline_metrics(self):
        for svc in SERVICES:
            base_rps = 100 if svc in ["frontend", "loadgenerator"] else random.randint(20, 80)
            base_latency = random.randint(10, 50)
            
            # Baseline is mostly healthy
            self.metrics[svc]["requests_per_sec"] = base_rps + random.randint(-10, 10)
            self.metrics[svc]["error_rate"] = round(random.uniform(0.0, 0.5), 2)
            self.metrics[svc]["latency_p95_ms"] = base_latency + random.randint(-5, 10)

    def apply_chaos_metrics(self):
        if not self.chaos_scenario:
            return
            
        if self.chaos_scenario == "payment_crash":
            self.metrics["paymentservice"]["error_rate"] = round(random.uniform(80.0, 100.0), 2)
            self.metrics["paymentservice"]["latency_p95_ms"] = random.randint(2000, 5000)
            self.metrics["checkoutservice"]["error_rate"] = round(random.uniform(40.0, 60.0), 2)
            self.metrics["checkoutservice"]["latency_p95_ms"] = random.randint(1000, 2000)
            self.metrics["frontend"]["error_rate"] = round(random.uniform(10.0, 20.0), 2)
            self.metrics["frontend"]["latency_p95_ms"] = random.randint(500, 1500)
            
        elif self.chaos_scenario == "frontend_spike":
            self.metrics["frontend"]["requests_per_sec"] = random.randint(2000, 3000)
            self.metrics["frontend"]["latency_p95_ms"] = random.randint(500, 1500)
            self.metrics["frontend"]["error_rate"] = round(random.uniform(20.0, 40.0), 2)
            self.metrics["cartservice"]["latency_p95_ms"] = random.randint(300, 800)

    async def run(self, log_callback):
        self.is_running = True
        while self.is_running:
            self.generate_baseline_metrics()
            self.apply_chaos_metrics()
            
            # Simulate high-volume logs: we only emit a sample to prevent overwhelming the UI
            active_svc = random.choice(SERVICES)
            log_callback(active_svc, "INFO", f"Processed request normally. latency={self.metrics[active_svc]['latency_p95_ms']}ms")
            
            if self.chaos_scenario:
                # Generate specific error logs
                if self.chaos_scenario == "payment_crash":
                    log_callback("paymentservice", "ERROR", "FATAL: PaymentService crashed: NullPointerException at payment connector")
                    log_callback("checkoutservice", "ERROR", "Payment failed for OrderID: 503 Service Unavailable API timeout")
                elif self.chaos_scenario == "frontend_spike":
                    log_callback("frontend", "ERROR", "503 Service Unavailable: overloaded, max connections reached")

            await asyncio.sleep(2)

simulator = BoutiqueSimulator()

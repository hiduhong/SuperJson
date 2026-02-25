export const DIRTY_SAMPLES = [
  String.raw`2024-06-02 11:08:15.412 INFO  [http-nio-8080-exec-9] [TraceId: a1b2c3d4] c.e.demo.controller.CartController : Add item request received. Payload:
 {"cart_id":"CART-20240602-0012","user":{"id":3102,"name":"li_ming","tier":"GOLD"},"item":{"sku":"SKU-4412","name":"Noise Cancelling Headphones","quantity":1,"price":899.00,"attributes":{"color":"Black","warranty":"1Y"}},"client":{"ip":"172.16.10.44","device":"iOS 17.4","app_version":"6.2.1"}} 
 
 2024-06-02 11:08:15.736 DEBUG [http-nio-8080-exec-9] [TraceId: a1b2c3d4] c.e.demo.service.CartService : Cart snapshot updated. Result:
 {"success":true,"cart_id":"CART-20240602-0012","items_count":3,"total_price":2647.00,"last_updated":"2024-06-02T11:08:15.730Z"} 
 
 2024-06-02 11:08:16.105 WARN  [async-pool-2] [TraceId: a1b2c3d4] c.e.demo.service.RecommendationService : Recommendation service latency high. Detail:
 {"threshold_ms":120,"duration_ms":468,"model":"rec-v3","fallback_used":true,"fallback_reason":"timeout"}`,
  String.raw`2024-07-19 19:33:27.008 INFO  [grpc-worker-1] [TraceId: e5f6g7h8] c.e.demo.grpc.PaymentGateway : Payment request received. Body:
 {"payment_id":"PAY-20240719-7788","order_id":"ORD-20240719-5566","method":{"type":"WECHAT_PAY","channel":"APP","scene":"WAP"},"amount":{"currency":"CNY","total":13998.00},"payer":{"id":5201,"nickname":"chen_qi"},"risk":{"score":12.4,"tags":["low_risk","known_device"]}}
 
 2024-07-19 19:33:27.421 ERROR [grpc-worker-1] [TraceId: e5f6g7h8] c.e.demo.grpc.PaymentGateway : Payment failed. Reason:
 {"code":"PAY_TIMEOUT","message":"Payment confirmation timeout","retryable":true,"retry_after_sec":5}`,
  String.raw`2024-09-03 08:54:12.990 INFO  [kafka-listener-5] [TraceId: k9l0m1n2] c.e.demo.consumer.UserEventConsumer : Received event. Payload:
 {"event_id":"evt_20240903_0007","event_type":"LOGIN","timestamp":"2024-09-03T08:54:12.988Z","user":{"id":9488,"region":"CN","device":{"os":"Windows 11","browser":"Edge 126"},"ip":"203.0.113.91"},"context":{"ua":"Mozilla/5.0","session":{"id":"sess_7788","ttl_sec":1800}}}
 
 2024-09-03 08:54:13.201 INFO  [kafka-listener-5] [TraceId: k9l0m1n2] c.e.demo.consumer.UserEventConsumer : Event processed. Result:
 {"status":"OK","latency_ms":213,"ack":true}`,
  String.raw`2024-10-11 22:14:45.667 INFO  [http-nio-8080-exec-2] [TraceId: p3q4r5s6] c.e.demo.controller.ReportController : Generate report request. Body:
 {"report_id":"RPT-20241011-0201","range":{"from":"2024-10-01","to":"2024-10-10"},"filters":{"regions":["CN","SG"],"channels":["WEB","APP"]},"options":{"format":"PDF","include_details":true}}
 
 2024-10-11 22:14:46.032 ERROR [http-nio-8080-exec-2] [TraceId: p3q4r5s6] c.e.demo.service.ReportService : Report generation failed. Error:
 {"error_code":"REPORT_TEMPLATE_MISSING","message":"Template not found","template_id":"tpl_2024_09_18","correlation_id":"corr-44-110"}`
];

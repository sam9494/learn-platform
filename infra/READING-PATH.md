# CSP TIMEBAR DEV 拓樸圖 — 學習閱讀路徑

對應檔案：
- `CSP-Timebar-DEV-04-infrastructure-architecture.drawio.svg`
- `CSP-Timebar-DEV-05-network-topology.drawio.svg`

---

## 看圖前要先建立的「空間感」

這兩張圖不是隨手畫的，是 Microsoft 官方的 **Cloud Adoption Framework / Azure Landing Zone** 參考架構的具體實作。先讀完 🥇 第一站，回頭看圖會立刻對得上位置。

---

## 🥇 第一站：整張圖長這樣的原因

1. **What is an Azure landing zone?**
   https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/
   - 重點：**Hub & Spoke 那張圖**、**Platform vs Application landing zones**
   - 對應：CSP TIMEBAR DEV 訂閱 = Application landing zone；Hub 訂閱 `9eedf903…` = Platform/Connectivity landing zone

2. **Hub-spoke network topology in Azure**（你們圖的範本）
   https://learn.microsoft.com/azure/architecture/networking/architecture/hub-spoke
   - 重點：開頭示意圖、`Hub-spoke concepts` 章節
   - 對應：Hub 裡的 VPN/ExpressRoute Gateway + Firewall + Private DNS 就是教科書答案

---

## 🥈 第二站：Spoke 之間怎麼連（Peering 不可遞）

3. **Azure virtual network peering（總覽）**
   https://learn.microsoft.com/azure/virtual-network/virtual-network-peering-overview
   - 重點：**Gateways and on-premises connectivity**、**Service chaining**
   - 對應：tst/uat 用 `useRemoteGateways=true` 借 Hub Gateway；AKS 沒設 → 出網要靠自己 SNAT

4. **VNet 連線選項與 spoke-to-spoke 通訊**
   https://learn.microsoft.com/azure/architecture/reference-architectures/hybrid-networking/virtual-network-peering
   - 牢記：「Peering connections are **nontransitive**.」
   - 對應：tst↔uat 一定要直接有 Peering，因為 tst 不能透過 AKS VNet 跳到 uat

> 💡 速記：`allowGatewayTransit` = 我（被借方）願意借 Gateway 出去；`useRemoteGateways` = 我（借方）要走對面的 Gateway。**兩邊各設一個方向**才會通。

---

## 🥉 第三站：Private Endpoint + Private DNS（為什麼 SQL PEP 集中放 uat）

5. **Azure Private Endpoint private DNS zone values**
   https://learn.microsoft.com/azure/private-link/private-endpoint-dns
   - 重點：CNAME 怎麼從「公網域名 → privatelink 子域 → 私有 IP」改寫
   - 對應：Hub 集中管 `privatelink.database.windows.net` 與 `privatelink.redis.cache.windows.net`

6. **Azure Private Endpoint DNS integration scenarios**
   https://learn.microsoft.com/azure/private-link/private-endpoint-dns-integration
   - 重點：`Azure Private Resolver for virtual network and on-premises workloads` 那張圖
   - 對應：tst Pod 解析 `xxx.database.windows.net` → 落在 `10.88.11.x`（uat db-snet 的 PEP）→ 走 AKS↔uat Peering 抵達

---

## 4️⃣ 第四站：AKS 那塊單獨補課

7. **AKS networking concepts（總覽）**
   https://learn.microsoft.com/azure/aks/concepts-network

8. **Customize cluster egress with outbound types**
   https://learn.microsoft.com/azure/aks/egress-outboundtype
   - 重點：`Outbound type: Load Balancer` 那張圖
   - 對應：AKS Public LB 上掛 PIP `20.195.99.214` 就是這個機制

9. **Use an internal load balancer with AKS**
   https://learn.microsoft.com/azure/aks/internal-lb
   - 對應：`kubernetes-internal 10.178.0.5` 就是 K8s `Service type=LoadBalancer` + `azure-load-balancer-internal: true` annotation 的產物

10. **Plan application networking for AKS**
    https://learn.microsoft.com/azure/aks/plan-application-networking
    - 對應：因為要用 host header 區分 `tst-timebar-frontend-*` / `uat-timebar-frontend-*`，所以前面是 AppGw（L7）

---

## 5️⃣ 第五站：Application Gateway

11. **Application Gateway components（必讀）**
    https://learn.microsoft.com/azure/application-gateway/application-gateway-components
    - 重點：`Listeners`（含 **Multi-site**）、`Request routing rules`
    - 對應：兩個 listener 用不同 host header 把 tst/uat 流量打到同一個 backend pool `10.178.0.5`

12. **How an application gateway works**
    https://learn.microsoft.com/azure/application-gateway/how-application-gateway-works
    - 看完能在腦中跑「使用者 → AppGw → backend pool → Pod → DB」全程

---

## 建議閱讀節奏

| 時段 | 讀什麼 | 預期收穫 |
|---|---|---|
| 第 1 天（30 分鐘） | 1 + 2 | 看到 Hub-Spoke 圖能秒指出你們圖的對應位置 |
| 第 2 天（30 分鐘） | 3 + 4 | 看 Peering 箭頭時知道方向、知道為什麼某些連線需要繞路 |
| 第 3 天（45 分鐘） | 5 + 6 | 能畫出「應用 → DNS → PEP → DB」的完整路徑 |
| 第 4 天（1 小時） | 7~10 | 看懂 AKS 為什麼一座要服務兩個環境、出站怎麼走 |
| 第 5 天（30 分鐘） | 11 + 12 | 看懂 AppGw 怎麼把 host name 分流到 namespace |

---

## 你們架構的核心事實（速查）

### VNet 速記
| VNet | CIDR | 角色 |
|---|---|---|
| `sea_tst_timebar_vnet` | **10.78.0.0/16** | tst 環境 |
| `sea-uat-timebar-vnet` | **10.88.0.0/16** | uat 環境 + 集中 SQL PEP |
| `sea_tst_timebar_aks_vnet` | **10.178.0.0/16** | 共用 AKS（跑 tst+uat） |

> 第二個 octet：**78=tst、88=uat、178=AKS**

### tst / uat VNet 4 個 Subnet（格式相同）
- `default` `.0.0/24` — 沒東西
- `db-snet` `.11.0/24` — PEP（Redis；uat 多放 SQL PEP）
- `appgw-snet` `.12.0/24` — ⚠️ 預留未用
- `intra-appgw-snet` `.13.0/24` — **實際 AppGw 在這**（IP `.13.87`）

### Peering 矩陣
| 來源 → 目的 | 設定 |
|---|---|
| tst ↔ uat | `allowForwardedTraffic=true`（讓 tst 過得去拿 SQL） |
| tst ↔ Hub | `useRemoteGateways=true` |
| uat ↔ Hub | `useRemoteGateways=true` |
| AKS ↔ tst | ✓ |
| AKS ↔ uat | ✓ |
| **AKS ↔ Hub** | **❌ 沒有** → AKS 出網靠自己 SNAT |

### 一個請求的完整路徑（tst 前端 → tst DB）
1. 內網 → Hub → tst VNet → AppGw `10.78.13.87`
2. AppGw → backend pool `10.178.0.5`（跨 AKS VNet，走 `tst↔AKS` Peering）
3. K8s Ingress → `tst-*` namespace 的 Pod
4. Pod 解析 `*.database.windows.net` → 拿到 PEP 私有 IP（DNS 來自 Hub Private DNS Zone）
5. 連線目標在 `10.88.11.x`（uat db-snet）→ 走 `AKS↔uat` Peering 到 SQL PEP

### 看圖時要記住的「異常清單」
1. **AKS 是 tst/uat 共用的單一 cluster**，只靠 namespace 隔離
2. **SQL 是 tst/uat 共用的單一 server**（Elastic Pool 兩個 DB）
3. **AKS API Server 走公網 + IP 白名單**（`211.20.51.131/32`、`104.43.77.58/32`），不是 Private Cluster
4. **AKS 沒跟 Hub Peering** → 出站不走 Hub Firewall，直接 SNAT 出去（`20.195.99.214`）
5. **`appgw-snet (.12)` 是預留沒用**；真正的 AppGw 在 `intra-appgw-snet (.13)`
6. **Storage 與 ACR 的 publicNetAccess 還開著** ⚠️
7. 一堆命名規範的 RG（webapp/vm/queue/monitor/notify）是空的

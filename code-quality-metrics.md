# 程式碼品質指標調查報告

> 主題：純靜態程式碼可量測的品質指標（不依賴執行環境、不依賴使用者行為）
> 整理日期：2026-04-30

---

## 0. 為何需要這些指標

業界與學界普遍採用 **ISO/IEC 25010:2023**（前身為 ISO/IEC 9126）作為軟體產品品質的母模型，定義 9 大品質特性：Functional Suitability、Performance Efficiency、Compatibility、Interaction Capability（原 Usability）、Reliability、Security、Maintainability、Flexibility（原 Portability）、Safety。下面所有「可從 codebase 直接量測」的指標，幾乎都對應到 **Maintainability**（可維護性）這條子線，因為它的子特性（Modularity、Reusability、Analysability、Modifiability、Testability）剛好都能以結構性度量近似。

---

## 1. 規模與複雜度（單檔 / 函式層級）

### 1.1 Lines of Code（LOC）
- **SLOC**（Source LOC）、**LLOC**（Logical LOC，計述句）、**Comment LOC**。
- 是所有指標的基底。**單獨使用價值低**，因為語言、風格差異極大；多半作為其他指標的 normalizer（每千行缺陷率、每千行覆蓋率）。

### 1.2 McCabe 循環複雜度（Cyclomatic Complexity, CC）
- 來源：McCabe, T.J. (1976). *A Complexity Measure*. IEEE TSE, SE-2(4), 308–320.
- 定義：控制流圖中線性獨立路徑數，等於 `決策節點數 + 1`。
- 業界經驗門檻（NIST / SEI 沿用）：
  - 1–10：低風險、容易測試
  - 11–20：中等
  - 21–50：高風險
  - >50：難以測試、應重構
- **批判**：Shepperd (1988) 和近年 Ajami et al. 都指出 CC 與「可理解性」的相關性不如預期，但因為計算簡單、與測試案例最少需求數有直觀關聯，仍是業界基線。

### 1.3 Halstead 軟體科學
- 來源：Halstead, M.H. (1977). *Elements of Software Science*. Elsevier.
- 從 4 個基本量（n1/n2 = 唯一運算元/運算子數，N1/N2 = 出現總次數）推導出：
  - Volume `V = N · log₂ n`
  - Difficulty `D = (n1/2) · (N2/n2)`
  - Effort `E = D · V`
  - Estimated Bugs `B ≈ V/3000`
- **價值**：是 Maintainability Index 的核心輸入；對「程式心智負擔」做出最早期的形式化嘗試。
- **限制**：對程式語言定義 operator/operand 的方式敏感，跨工具結果不可比。

### 1.4 認知複雜度（Cognitive Complexity）
- 來源：Campbell, G.A. (2018). *Cognitive Complexity—A New Way of Measuring Understandability*. SonarSource White Paper / TechDebt 2018。
- 設計動機：CC 把 `switch` case 全部當決策、把 `&&` 短路也算入，與「人類覺得難不難讀」未必一致。Cognitive Complexity 改採三條規則：
  1. 忽略不增加心智負擔的結構（method 宣告、null-coalescing）
  2. 巢狀疊加（nested `if` 裡的 `if` 加更多分數）
  3. 每個破壞線性閱讀流的結構 +1（`if`、`for`、`catch`、`goto`、`break label`、邏輯運算子序列）
- **業界採用**：SonarQube/SonarCloud 預設指標，已成 PR review 的事實標準之一。

### 1.5 NPATH、Essential Complexity
- NPATH（Nejmeh, 1988）：可能的執行路徑數，比 CC 更悲觀（指數成長）。
- Essential Complexity（McCabe 後續工作）：移除結構化元素後剩餘的 CC，用來量測「義大利麵條程度」。

---

## 2. 物件導向設計指標：CK 套件

來源（必讀）：**Chidamber, S.R. & Kemerer, C.F. (1994). *A Metrics Suite for Object Oriented Design*. IEEE TSE, 20(6), 476–493.**（被引用 6,000+ 次，是 OO 度量的奠基之作）

| 指標 | 全名 | 直觀意義 | 經驗門檻 |
|---|---|---|---|
| WMC | Weighted Methods per Class | 類別內方法的複雜度總和（常以 CC 加權） | <20 較佳 |
| DIT | Depth of Inheritance Tree | 從根到該類別的繼承深度 | ≤5–6 |
| NOC | Number of Children | 直接子類別數 | 視框架而定 |
| CBO | Coupling Between Object classes | 與其他類別有耦合的數量 | <14 |
| RFC | Response For a Class | 該類別本身方法 + 它會呼叫到的方法總數 | <50 |
| LCOM | Lack of Cohesion in Methods | 方法之間共享屬性的程度（值愈大愈不內聚） | 越低越好 |

後續校驗以 Basili et al. (1996) "*A Validation of Object-Oriented Design Metrics as Quality Indicators*" 最權威 — 用 NASA 的 8 個 C++ 系統，發現 CBO、RFC、WMC 與缺陷顯著相關，DIT/NOC 較弱。

---

## 3. 耦合與內聚的細分指標

### 3.1 Martin 套件層耦合（套件/模組層）
- 來源：Martin, R.C. (1994). *OO Design Quality Metrics: An Analysis of Dependencies*.
- **Afferent Coupling (Ca)**：有多少外部套件依賴本套件（被依賴）
- **Efferent Coupling (Ce)**：本套件依賴多少其他套件（依賴別人）
- **Instability `I = Ce / (Ca + Ce)`**：0 = 完全穩定，1 = 完全不穩定
- **Abstractness `A = 抽象類別數 / 總類別數`**
- **Distance from Main Sequence `D = |A + I − 1|`**：偏離主序線愈遠表示愈失衡。
  - 左下 `(0,0)` = Zone of Pain（具體又被很多人依賴，難改）
  - 右上 `(1,1)` = Zone of Uselessness（抽象但沒人用）

### 3.2 內聚度量的細分（LCOM 系列）
LCOM 不是單一指標，而是一族：
- **LCOM1**（Chidamber & Kemerer 1991 原版）：不共享屬性的方法對 − 共享的方法對。
- **LCOM2/3/4**（Hitz & Montazeri 1995；Henderson-Sellers 1996）：修正 LCOM1 的數學缺陷（會給出負值、不單調等）。
  - **LCOM4**：把方法視為節點、共享屬性或互呼為邊，計算連通分量數（=1 表示完美內聚）。
- **LCOM_HS（Henderson-Sellers）**：取 [0,2] 區間，>1 即警訊；常見於 NDepend、Understand 等商業工具。
- **TCC / LCC**（Bieman & Kang, 1995）：Tight / Loose Class Cohesion，以「方法對之間直接/間接共享屬性」的比例計算。1.0 為最佳。

### 3.3 MOOD 與 QMOOD（補充模型）
- **MOOD**（Brito e Abreu & Carapuça, 1994）：6 個比率（MHF、AHF、MIF、AIF、PF、CF），衡量封裝、繼承、耦合、多型。
- **QMOOD**（Bansiya & Davis, 2002, IEEE TSE 28(1): 4–17）：階層式模型，把底層度量（DSC、NOH、ANA、CAM、DCC、MOA…）對應到上層品質屬性（Reusability、Flexibility、Understandability、Functionality、Extendibility、Effectiveness）。是把「設計屬性 → 品質屬性」綁定起來的學術代表作。

---

## 4. 綜合可維護性指標

### 4.1 Maintainability Index (MI)
- 來源：Oman, P. & Hagemeister, J. (1992). *Metrics for assessing a software system's maintainability*. ICSM 1992.
- 公式（HP 系統迴歸後得出）：
  ```
  MI = 171 − 5.2·ln(V) − 0.23·CC − 16.2·ln(LOC)  [+ 50·sin(√(2.4·CommentRatio))]
  ```
- Microsoft Visual Studio 將其縮放至 0–100（>20 綠、10–19 黃、<10 紅）。
- **批判**：Arie van Deursen (2014, *Think Twice Before Using the Maintainability Index*) 指出 MI 訓練資料來自 80 年代 C/Pascal 系統，公式對現代 OO/動態語言效力存疑，且把 ln(LOC) 當負項會懲罰所有大檔案，但有些大檔案是合理的。**業界趨勢是用 SIG 模型取代它。**

### 4.2 SIG Maintainability Model
- 來源：Heitlager, I., Kuipers, T., Visser, J. (2007). *A Practical Model for Measuring Maintainability*. QUATIC 2007.
- 由荷蘭 Software Improvement Group 提出，現為其商業平台 Sigrid 的核心。
- 將 5 個底層量（**Volume、Duplication、Unit Size、Unit Complexity、Unit Test Coverage**）以 ++ / + / o / − / −− 五級 benchmark（依其 200B+ 行 / 18,000+ 系統的全球資料庫排名分位數），加總成 ISO 25010 子特性的星等（1–5 星）。
- 已於 2024 取得 ISO 25010 maintainability 認證，是少數有「跨產業常模分位」可比較的方法。

### 4.3 SQALE 與技術債
- 來源：Letouzey, J.-L. (2012). *The SQALE Method for Evaluating Technical Debt*. Workshop on Managing Technical Debt @ ICSE.
- SQALE = Software Quality Assessment based on Lifecycle Expectations。
- 把每條 rule 違反換算為 **remediation cost**（修正所需人時），加總得到「技術債本金」；再以「修正後可省下的維護成本」作為「利息」。
- **SonarQube 的 Technical Debt Ratio = remediation cost / development cost** 即源自此方法。

---

## 5. 測試相關度量

### 5.1 程式碼覆蓋率
| 強度（弱→強） | 名稱 | 涵蓋對象 |
|---|---|---|
| 1 | Statement / Line | 每行被執行 |
| 2 | Branch / Decision | 每個 true/false 分支被走過 |
| 3 | Condition | 每個布林子表達式各取 true/false |
| 4 | MC/DC | 每個子條件能獨立改變結果（航空、醫療強制：DO-178C Level A） |
| 5 | Path | 所有可能路徑（理論值，通常不可達） |

### 5.2 突變測試分數（Mutation Score）
- 來源：DeMillo, Lipton & Sayward (1978). *Hints on Test Data Selection*. IEEE Computer.
- 在原始碼植入小變動（mutant），看測試是否殺得掉它；分數 = killed / total mutants。
- 工具：**PIT**（Java 業界標準）、Stryker（JS/.NET/Scala）、MuJava（學術）。
- 為什麼比 coverage 強：覆蓋率只看「有沒有執行到」，突變測試逼測試用例去**驗證行為**。

### 5.3 覆蓋率的限制（必讀）
- **Inozemtseva, L. & Holmes, R. (2014). *Coverage is Not Strongly Correlated with Test Suite Effectiveness*. ICSE 2014.**
  - 5 個大型 Java 專案、31,000 個生成的測試套件，控制套件大小後，**coverage 與抓 bug 能力的相關係數僅 0.3–0.5**；branch / MC/DC 也沒比 line 顯著好。
- 結論：coverage 該追，但「100% coverage 等於品質高」是迷思。應該與 mutation score、assertion density 一起看。

---

## 6. 程式碼重複（Duplication）

### 6.1 Clone 的四種類型
- 來源：Roy, C.K., Cordy, J.R. & Koschke, R. (2009). *Comparison and Evaluation of Code Clone Detection Techniques and Tools: A Qualitative Approach*. Science of Computer Programming, 74(7): 470–495.
  - **Type-1**：完全相同（除空白/註解）
  - **Type-2**：識別字 / 字面量 / 型別不同，結構相同
  - **Type-3**：增刪少數陳述句的近相似
  - **Type-4**：語意相同但語法完全不同（語意 clone）
- 工具：**CCFinder**（Kamiya et al., 2002, IEEE TSE）、**NiCad**（Roy & Cordy, ICPC 2008）、**Deckard**（基於 AST 向量）、**SourcererCC**（大規模 token-based）。
- 業界經驗：5–20% 重複是常態，>10% 通常是維護債務警訊（SIG benchmark 把 ≤3% 評為 ++）。

---

## 7. 程式碼異味（Code Smells）

- 概念來源：Fowler, M. (1999, 2nd ed. 2018). *Refactoring: Improving the Design of Existing Code*. Addison-Wesley.
- 工具會自動偵測典型 smell：
  - God Class（WMC、LCOM、ATFD 異常高）
  - Feature Envy（一方法呼叫另類別屬性多於自己）
  - Long Method、Long Parameter List、Shotgun Surgery、Divergent Change 等。
- 學術代表偵測法：Lanza & Marinescu (2006). *Object-Oriented Metrics in Practice*（提出以「detection strategies」用閾值組合自動偵測 smell）。

---

## 8. 缺陷預測與經驗實證

兩篇必讀的實證研究：
- **Basili, V.R., Briand, L.C. & Melo, W.L. (1996). *A Validation of Object-Oriented Design Metrics as Quality Indicators*. IEEE TSE, 22(10): 751–761.** — 證實 CK 套件（特別是 CBO/RFC/WMC）能顯著預測 fault-proneness。
- **Nagappan, N., Ball, T. & Zeller, A. (2006). *Mining Metrics to Predict Component Failures*. ICSE 2006.** — 微軟內部資料證實沒有「萬用」最佳指標；不同產品對應不同最佳子集。

這告訴我們：**任何單一指標都不該被當成唯一決策依據；要做專案內的迴歸校準。**

---

## 9. 工具地景（純靜態、可以掃 codebase 的）

| 工具 | 強項 | 開源/商業 |
|---|---|---|
| **SonarQube / SonarCloud** | Cognitive Complexity、SQALE 技術債、800+ rules、多語言 | 開源 + 商業 |
| **Sigrid (SIG)** | ISO 25010 對標 + 全球 benchmark | 商業 |
| **CAST Highlight / Imaging** | 大型企業組合分析、架構契約 | 商業 |
| **NDepend** | .NET 的 CK + Martin 指標、依賴矩陣 | 商業 |
| **Understand (SciTools)** | 多語言、CK + Halstead + MI 完整 | 商業 |
| **CodeClimate / CodeScene** | CodeScene 額外納入 git history（hotspots） | 商業 |
| **PMD / Checkstyle / ESLint** | 語法級規則 | 開源 |
| **PIT / Stryker** | 突變測試 | 開源 |
| **Lizard / radon / cloc** | 輕量 CLI（CC、Halstead、LOC） | 開源 |

---

## 10. 整體建議：怎麼挑指標組合

對單一專案做品質健檢，學術社群與 SIG 經驗指向以下「最小可用組合」：

1. **規模**：LOC、檔案數、模組數
2. **單元複雜度**：Cyclomatic + Cognitive Complexity（搭配看才完整）
3. **單元大小**：方法行數分布（>60 行的比例）
4. **耦合**：CBO（類別層）+ Martin Instability（套件層）
5. **內聚**：LCOM_HS 或 LCOM4
6. **重複**：Type-1+2+3 重複比例
7. **可測試性**：Branch coverage + Mutation Score
8. **技術債**：SQALE Technical Debt Ratio
9. **架構穩定性**：Distance from Main Sequence、循環依賴數

**重點觀念**（這也是學術界一致的告誡）：
- 指標只是「警訊偵測器」，不是品質的定義。
- 跨專案、跨語言比較絕對值幾乎沒意義；**比趨勢（時間序列）和分位數（同類專案常模）才有效**。
- 配合 git history（變更頻率、共同變更、bus factor）使用，才是現代「Software Analytics」的玩法（推薦：Bird, Menzies & Zimmermann 2015, *The Art and Science of Analyzing Software Data*）。

---

## 推薦閱讀清單（依重要性）

1. Chidamber & Kemerer (1994) — CK 度量原典
2. McCabe (1976) — Cyclomatic Complexity 原典
3. Basili, Briand & Melo (1996) — CK 的實證驗證
4. Bansiya & Davis (2002) — QMOOD 階層模型
5. Heitlager, Kuipers & Visser (2007) — SIG Maintainability Model
6. Letouzey (2012) — SQALE 技術債方法
7. Inozemtseva & Holmes (2014) — 覆蓋率不等於品質
8. Roy, Cordy & Koschke (2009) — Clone 偵測完整綜述
9. Campbell (2018) — Cognitive Complexity 白皮書
10. ISO/IEC 25010:2023 — 業界品質模型標準
11. Lanza & Marinescu (2006) — *Object-Oriented Metrics in Practice*（最實用的書）
12. Fowler (2018, 2nd ed.) — *Refactoring*（code smell 觀念來源）

---

## 線上資源連結

- [A Metrics Suite for Object Oriented Design — Chidamber & Kemerer 1994 (PDF)](https://www.eso.org/~tcsmgr/oowg-forum/TechMeetings/Articles/OOMetrics.pdf)
- [A Complexity Measure — McCabe 1976 (PDF)](http://www.literateprogramming.com/mccabe.pdf)
- [Cyclomatic complexity — Wikipedia](https://en.wikipedia.org/wiki/Cyclomatic_complexity)
- [Halstead complexity measures — Wikipedia](https://en.wikipedia.org/wiki/Halstead_complexity_measures)
- [Cognitive Complexity White Paper — SonarSource (PDF)](https://www.sonarsource.com/docs/CognitiveComplexity.pdf)
- [Cognitive Complexity (TechDebt 2018) — ACM](https://dl.acm.org/doi/10.1145/3194164.3194186)
- [SIG Maintainability Model overview](https://www.softwareimprovementgroup.com/blog/maintainability-model-2024-update/)
- [Sigrid: Code Quality and Maintainability](https://www.softwareimprovementgroup.com/sigrid/code-quality-maintainability/)
- [Comparing MI, SIG, and SQALE for Technical Debt — Hindawi 2020](https://www.hindawi.com/journals/sp/2020/2976564/)
- [The SQALE Method for Evaluating Technical Debt — Letouzey (PDF)](https://www.researchgate.net/profile/Jean-Louis-Letouzey-2/publication/239763591_The_SQALE_method_for_evaluating_Technical_Debt/links/0c9605357748774a21000000/The-SQALE-method-for-evaluating-Technical-Debt.pdf)
- [SQALE — Wikipedia](https://en.wikipedia.org/wiki/SQALE)
- [ISO/IEC 25010 standard preview (PDF)](https://www.vde-verlag.de/iec-normen/preview-pdf/info_isoiec25010%7Bed2.0%7Den.pdf)
- [Quality characteristics ISO 25010 — TMAP](https://www.tmap.net/wiki/quality-characteristics-iso25010/)
- [Coverage Is Not Strongly Correlated with Test Suite Effectiveness — Inozemtseva & Holmes (PDF)](https://www.cs.ubc.ca/~rtholmes/papers/icse_2014_inozemtseva.pdf)
- [How effective are mutation testing tools? — Kintis et al. (PDF)](https://orbilu.uni.lu/bitstream/10993/35336/1/Kintis_EMSE_2017.pdf)
- [PIT Mutation Testing](https://pitest.org/)
- [Maintainability Index — critique by van Deursen](https://avandeursen.com/2014/08/29/think-twice-before-using-the-maintainability-index/)
- [OO Design Quality Metrics — Robert Martin (PDF)](https://linux.ime.usp.br/~joaomm/mac499/arquivos/referencias/oodmetrics.pdf)
- [Software package metrics — Wikipedia](https://en.wikipedia.org/wiki/Software_package_metrics)
- [A Hierarchical Model for OO Design Quality Assessment — Bansiya & Davis 2002 (PDF)](https://www.ptidej.net/team/admission/Bansiya02-QualityModel.pdf)
- [Cohesion metrics — Aivosto reference](https://www.aivosto.com/project/help/pm-oo-cohesion.html)
- [A Pedagogical Evaluation of LCOM — arXiv](https://arxiv.org/pdf/1004.3277)
- [A Survey on Software Clone Detection Research — Roy & Cordy 2007 (PDF)](https://research.cs.queensu.ca/TechReports/Reports/2007-541.pdf)
- [The NiCad Clone Detector — Cordy & Roy ICPC 2011 (PDF)](https://www.cs.usask.ca/~croy/papers/2011/CR-NiCad-Tool-ICPC11.pdf)

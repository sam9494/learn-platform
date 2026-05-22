"""
KNN (K-Nearest Neighbors) 範例集
================================
包含四個範例：
1. 用 scikit-learn 做最簡單的分類
2. 用交叉驗證找最佳 K
3. 手刻 KNN（理解原理）
4. 視覺化決策邊界
"""

import numpy as np
from collections import Counter

from sklearn.datasets import load_iris, make_classification
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score


# ============================================================
# 範例 1：最簡單的 KNN 分類
# ============================================================
def example_1_basic():
    print("=" * 50)
    print("範例 1：基本 KNN 分類（鳶尾花資料集）")
    print("=" * 50)

    X, y = load_iris(return_X_y=True)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    knn = KNeighborsClassifier(n_neighbors=5)
    knn.fit(X_train, y_train)

    y_pred = knn.predict(X_test)
    print(f"K=5 的準確率：{accuracy_score(y_test, y_pred):.2%}\n")

    return X, y, X_train, X_test, y_train, y_test


# ============================================================
# 範例 2：用交叉驗證找最佳 K
# ============================================================
def example_2_find_best_k(X, y):
    print("=" * 50)
    print("範例 2：用交叉驗證找最佳 K")
    print("=" * 50)

    scores = []
    k_range = range(1, 21)

    for k in k_range:
        knn = KNeighborsClassifier(n_neighbors=k)
        cv_scores = cross_val_score(knn, X, y, cv=5)
        scores.append(cv_scores.mean())

    best_k = k_range[np.argmax(scores)]
    print(f"最佳 K = {best_k}，準確率 = {max(scores):.2%}")

    print("\n各 K 值的準確率：")
    for k, s in zip(k_range, scores):
        bar = "#" * int(s * 50)
        print(f"  K={k:2d}: {s:.2%}  {bar}")
    print()


# ============================================================
# 範例 3：手刻 KNN（理解原理）
# ============================================================
def knn_predict(X_train, y_train, x_new, k=3):
    """手刻版 KNN：用歐氏距離 + 多數決投票"""
    # 1. 算新點到每個訓練點的歐氏距離
    distances = np.sqrt(np.sum((X_train - x_new) ** 2, axis=1))

    # 2. 找最近的 k 個鄰居的 index
    k_idx = np.argsort(distances)[:k]

    # 3. 取出這些鄰居的標籤，投票
    k_labels = y_train[k_idx]
    return Counter(k_labels).most_common(1)[0][0]


def example_3_from_scratch(X_train, X_test, y_train, y_test):
    print("=" * 50)
    print("範例 3：手刻 KNN")
    print("=" * 50)

    # 對整個測試集做預測
    preds = np.array([
        knn_predict(X_train, y_train, x, k=5)
        for x in X_test
    ])

    acc = (preds == y_test).mean()
    print(f"手刻 KNN (K=5) 的準確率：{acc:.2%}")
    print(f"前 5 筆預測 vs 實際：")
    for i in range(5):
        mark = "OK" if preds[i] == y_test[i] else "XX"
        print(f"  [{mark}] 預測={preds[i]}, 實際={y_test[i]}")
    print()


# ============================================================
# 範例 4：視覺化決策邊界
# ============================================================
def example_4_visualize():
    print("=" * 50)
    print("範例 4：視覺化 KNN 決策邊界")
    print("=" * 50)

    try:
        import matplotlib.pyplot as plt
    except ImportError:
        print("（未安裝 matplotlib，跳過此範例）")
        print("安裝指令：pip install matplotlib\n")
        return

    # 造一個 2D 二分類資料
    X, y = make_classification(
        n_samples=200, n_features=2, n_redundant=0,
        n_clusters_per_class=1, random_state=42
    )

    # 比較不同 K 值
    fig, axes = plt.subplots(1, 3, figsize=(15, 5))
    for ax, k in zip(axes, [1, 5, 50]):
        knn = KNeighborsClassifier(n_neighbors=k)
        knn.fit(X, y)

        x_min, x_max = X[:, 0].min() - 1, X[:, 0].max() + 1
        y_min, y_max = X[:, 1].min() - 1, X[:, 1].max() + 1
        xx, yy = np.meshgrid(
            np.arange(x_min, x_max, 0.02),
            np.arange(y_min, y_max, 0.02),
        )
        Z = knn.predict(np.c_[xx.ravel(), yy.ravel()]).reshape(xx.shape)

        ax.contourf(xx, yy, Z, alpha=0.3, cmap="coolwarm")
        ax.scatter(X[:, 0], X[:, 1], c=y, edgecolors="k", cmap="coolwarm")
        ax.set_title(f"KNN Decision Boundary (K={k})")

    plt.tight_layout()
    plt.savefig("knn_decision_boundary.png", dpi=100)
    print("已將圖儲存為 knn_decision_boundary.png")
    plt.show()


# ============================================================
# 主程式
# ============================================================
if __name__ == "__main__":
    X, y, X_train, X_test, y_train, y_test = example_1_basic()
    example_2_find_best_k(X, y)
    example_3_from_scratch(X_train, X_test, y_train, y_test)
    example_4_visualize()

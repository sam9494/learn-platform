"""
KNN 邊界比較：K=1 vs K=50
========================
這個範例專門展示「過擬合」vs「欠擬合」的視覺對比。

K=1：邊界破碎、每個訓練點都有自己的領地（過擬合）
K=50：邊界平滑、忽略細節（欠擬合）
"""

import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_moons
from sklearn.neighbors import KNeighborsClassifier


def plot_decision_boundary(ax, X, y, k, title):
    """畫出指定 K 值的 KNN 決策邊界"""
    knn = KNeighborsClassifier(n_neighbors=k)
    knn.fit(X, y)

    # 建立網格
    x_min, x_max = X[:, 0].min() - 0.5, X[:, 0].max() + 0.5
    y_min, y_max = X[:, 1].min() - 0.5, X[:, 1].max() + 0.5
    xx, yy = np.meshgrid(
        np.arange(x_min, x_max, 0.02),
        np.arange(y_min, y_max, 0.02),
    )

    # 預測每個網格點的類別
    Z = knn.predict(np.c_[xx.ravel(), yy.ravel()]).reshape(xx.shape)

    # 畫背景色塊（決策區域）
    ax.contourf(xx, yy, Z, alpha=0.35, cmap="coolwarm")
    # 畫邊界線
    ax.contour(xx, yy, Z, colors="black", linewidths=0.8)
    # 畫資料點
    ax.scatter(
        X[:, 0], X[:, 1],
        c=y, cmap="coolwarm",
        edgecolors="black", s=40,
    )

    # 訓練準確率
    train_acc = knn.score(X, y)
    ax.set_title(f"{title}\nK={k}, train acc={train_acc:.2%}", fontsize=13)
    ax.set_xticks([])
    ax.set_yticks([])


def main():
    # 用 make_moons：兩個交錯的半月形，是 KNN 的經典示範資料
    # noise=0.25 故意加雜訊，這樣 K=1 的過擬合會非常明顯
    X, y = make_moons(n_samples=200, noise=0.25, random_state=42)

    # 三張子圖：K=1 / K=5 / K=50
    fig, axes = plt.subplots(1, 3, figsize=(16, 5.5))

    plot_decision_boundary(
        axes[0], X, y, k=1,
        title="Overfitting (too jagged)"
    )
    plot_decision_boundary(
        axes[1], X, y, k=5,
        title="Balanced (just right)"
    )
    plot_decision_boundary(
        axes[2], X, y, k=50,
        title="Underfitting (too smooth)"
    )

    fig.suptitle(
        "KNN Decision Boundary: K=1 vs K=5 vs K=50",
        fontsize=15, y=1.02,
    )

    plt.tight_layout()
    out_path = "knn_k1_vs_k50.png"
    plt.savefig(out_path, dpi=120, bbox_inches="tight")
    print(f"已存檔：{out_path}")
    plt.show()


if __name__ == "__main__":
    main()

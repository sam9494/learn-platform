"""
StandardScaler vs MinMaxScaler 視覺對比
=====================================
比較兩種縮放方法在「正常資料」和「有極端值」的情況下表現。

重點觀察：
1. 縮放後資料的「分布形狀不變」，只是 x 軸刻度變了
2. MinMaxScaler 遇到極端值會崩壞（把正常資料擠成一坨）
3. StandardScaler 比較抗極端值
"""

import numpy as np
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler, MinMaxScaler


def plot_distributions(data, title, ax_row, label):
    """畫出原始 + 兩種縮放後的分布"""
    scaler_std = StandardScaler()
    scaler_minmax = MinMaxScaler()

    data_std = scaler_std.fit_transform(data.reshape(-1, 1)).flatten()
    data_minmax = scaler_minmax.fit_transform(data.reshape(-1, 1)).flatten()

    # 原始
    ax_row[0].hist(data, bins=30, color="gray", edgecolor="black")
    ax_row[0].set_title(f"{label} - Original\nmean={data.mean():.1f}, std={data.std():.1f}")

    # StandardScaler
    ax_row[1].hist(data_std, bins=30, color="steelblue", edgecolor="black")
    ax_row[1].set_title(
        f"{label} - StandardScaler\n"
        f"mean={data_std.mean():.2f}, std={data_std.std():.2f}"
    )
    ax_row[1].axvline(0, color="red", linestyle="--", linewidth=1)

    # MinMaxScaler
    ax_row[2].hist(data_minmax, bins=30, color="orange", edgecolor="black")
    ax_row[2].set_title(
        f"{label} - MinMaxScaler\n"
        f"min={data_minmax.min():.2f}, max={data_minmax.max():.2f}"
    )
    ax_row[2].set_xlim(-0.1, 1.1)


def main():
    np.random.seed(42)

    # 情境 1：正常資料（常態分布）
    normal_data = np.random.normal(loc=50, scale=10, size=500)

    # 情境 2：正常資料 + 一筆極端值
    outlier_data = np.concatenate([
        np.random.normal(loc=50, scale=10, size=499),
        [500],  # 一筆極端值
    ])

    fig, axes = plt.subplots(2, 3, figsize=(15, 8))

    plot_distributions(normal_data, "Normal data", axes[0], "Case 1")
    plot_distributions(outlier_data, "Data with 1 outlier", axes[1], "Case 2")

    fig.suptitle(
        "StandardScaler vs MinMaxScaler\n"
        "(notice how MinMax breaks when an outlier appears)",
        fontsize=14,
    )

    plt.tight_layout()
    out_path = "scaling_comparison.png"
    plt.savefig(out_path, dpi=120, bbox_inches="tight")
    print(f"已存檔：{out_path}")

    # 文字總結
    print("\n=== 數字摘要 ===")
    print("Case 1 (正常資料):")
    print(f"  原始範圍：{normal_data.min():.1f} ~ {normal_data.max():.1f}")
    print(f"  Standard: 平均=0, 標準差=1，資料分散合理")
    print(f"  MinMax:   壓到 [0, 1]，分散合理")

    print("\nCase 2 (有 1 筆極端值=500):")
    minmax_outlier = MinMaxScaler().fit_transform(outlier_data.reshape(-1, 1)).flatten()
    normal_part = minmax_outlier[:-1]  # 排除極端值
    print(f"  原始範圍：{outlier_data.min():.1f} ~ {outlier_data.max():.1f}")
    print(f"  MinMax 後，99% 正常資料被擠到 [{normal_part.min():.3f}, {normal_part.max():.3f}]")
    print(f"  → 等於沒縮放！極端值佔據整個 [0, 1] 空間")

    plt.show()


if __name__ == "__main__":
    main()

"""
StandardScaler vs MinMaxScaler 放大主體
=====================================
上一個範例看不出差別，因為極端值把 x 軸拉太遠。
這次把「主體區域」放大，你會清楚看見兩者的不同。
"""

import numpy as np
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler, MinMaxScaler


def main():
    np.random.seed(42)

    # 帶 1 筆極端值的資料
    data = np.concatenate([
        np.random.normal(loc=50, scale=10, size=499),
        [500],  # 極端值
    ]).reshape(-1, 1)

    std_data = StandardScaler().fit_transform(data).flatten()
    minmax_data = MinMaxScaler().fit_transform(data).flatten()

    fig, axes = plt.subplots(2, 2, figsize=(14, 9))

    # === 上排：完整 x 軸（看極端值在哪）===
    axes[0, 0].hist(std_data, bins=50, color="steelblue", edgecolor="black")
    axes[0, 0].set_title("StandardScaler - Full view\n(outlier visible on the right)")
    axes[0, 0].axvline(0, color="red", linestyle="--")

    axes[0, 1].hist(minmax_data, bins=50, color="orange", edgecolor="black")
    axes[0, 1].set_title("MinMaxScaler - Full view\n(outlier visible on the right)")

    # === 下排：放大主體（前 99% 資料的範圍）===
    # Standard 的主體大約在 -3 ~ 4
    axes[1, 0].hist(std_data, bins=50, color="steelblue", edgecolor="black")
    axes[1, 0].set_xlim(-3, 4)
    axes[1, 0].set_title(
        "StandardScaler - ZOOM IN to main body\n"
        "Main data spread across [-3, 4] — looks healthy!"
    )
    axes[1, 0].axvline(0, color="red", linestyle="--")

    # MinMax 的主體被擠到哪？算一下
    main_min = minmax_data[:-1].min()
    main_max = minmax_data[:-1].max()
    axes[1, 1].hist(minmax_data, bins=50, color="orange", edgecolor="black")
    axes[1, 1].set_xlim(0, 0.2)
    axes[1, 1].set_title(
        f"MinMaxScaler - ZOOM IN to main body\n"
        f"Main data squashed into [{main_min:.3f}, {main_max:.3f}] !!"
    )

    fig.suptitle(
        "Same data, different scalers - notice the SCALE difference",
        fontsize=14,
    )
    plt.tight_layout()
    plt.savefig("scaling_zoom.png", dpi=120, bbox_inches="tight")
    print("已存檔：scaling_zoom.png")

    # 用文字數據佐證
    print("\n=== 主體資料（排除極端值）的範圍 ===")
    print(f"StandardScaler: [{std_data[:-1].min():.3f}, {std_data[:-1].max():.3f}]")
    print(f"  → 跨度 = {std_data[:-1].max() - std_data[:-1].min():.3f}")
    print(f"MinMaxScaler:   [{minmax_data[:-1].min():.3f}, {minmax_data[:-1].max():.3f}]")
    print(f"  → 跨度 = {minmax_data[:-1].max() - minmax_data[:-1].min():.3f}")
    print()
    print("結論：MinMax 把 99% 的正常資料壓成一小坨，幾乎沒拉開差異")
    print("      而 Standard 還能讓正常資料有合理的差距")

    plt.show()


if __name__ == "__main__":
    main()

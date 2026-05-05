"""
Setup script to prepare training data from the Kaggle dataset.

This script copies images from the Kaggle dataset structure to the
training directory structure expected by train_freshness_model.py.

Kaggle dataset structure:
    fresh_apples/, fresh_oranges/, ...
    stale_apples/, stale_oranges/, ...

Expected structure:
    data/fresh/ (all fresh images)
    data/stale/ (all stale images)

Usage:
    python setup_training_data.py --kaggle_dir PATH_TO_KAGGLE_DATASET --output_dir ./data
"""

import os
import argparse
import shutil
from pathlib import Path


def setup_training_data(kaggle_dir, output_dir):
    """
    Copy images from Kaggle dataset structure to training structure.

    Args:
        kaggle_dir: Path to Kaggle dataset directory
        output_dir: Output directory for training data
    """
    print(f"Setting up training data...")
    print(f"  Kaggle dataset: {kaggle_dir}")
    print(f"  Output directory: {output_dir}")

    # Create output directories
    fresh_output = os.path.join(output_dir, 'fresh')
    stale_output = os.path.join(output_dir, 'stale')

    os.makedirs(fresh_output, exist_ok=True)
    os.makedirs(stale_output, exist_ok=True)

    # Process each subdirectory in the Kaggle dataset
    fresh_count = 0
    stale_count = 0

    for item_dir in os.listdir(kaggle_dir):
        item_path = os.path.join(kaggle_dir, item_dir)

        if not os.path.isdir(item_path):
            continue

        if item_dir.startswith('fresh'):
            # Copy all images to fresh directory
            for image_file in os.listdir(item_path):
                src_path = os.path.join(item_path, image_file)
                dst_path = os.path.join(fresh_output, image_file)

                # Handle duplicate filenames
                if os.path.exists(dst_path):
                    base, ext = os.path.splitext(image_file)
                    dst_path = os.path.join(fresh_output, f"{base}_fresh_{fresh_count}{ext}")

                shutil.copy2(src_path, dst_path)
                fresh_count += 1

        elif item_dir.startswith('stale'):
            # Copy all images to stale directory
            for image_file in os.listdir(item_path):
                src_path = os.path.join(item_path, image_file)
                dst_path = os.path.join(stale_output, image_file)

                # Handle duplicate filenames
                if os.path.exists(dst_path):
                    base, ext = os.path.splitext(image_file)
                    dst_path = os.path.join(stale_output, f"{base}_stale_{stale_count}{ext}")

                shutil.copy2(src_path, dst_path)
                stale_count += 1

    print(f"\nSetup complete!")
    print(f"  Fresh images: {fresh_count}")
    print(f"  Stale images: {stale_count}")
    print(f"  Total: {fresh_count + stale_count}")
    print(f"\nTraining data location: {output_dir}")
    print("\nTo train the model, run:")
    print(f"  python train_freshness_model.py --data_dir {output_dir} --epochs 25")


def main():
    parser = argparse.ArgumentParser(description='Setup training data for freshness model')
    parser.add_argument('--kaggle_dir', type=str, required=True,
                        help='Path to Kaggle dataset directory')
    parser.add_argument('--output_dir', type=str, default='./data',
                        help='Output directory for training data')

    args = parser.parse_args()

    if not os.path.exists(args.kaggle_dir):
        print(f"Error: Kaggle dataset directory not found: {args.kaggle_dir}")
        print("\nDownload the dataset from:")
        print("https://www.kaggle.com/datasets/fresh-and-stale-images-of-fruits-and-vegetables")
        print("\nOr extract from the notebook data directory if using Kaggle notebooks.")
        return

    setup_training_data(args.kaggle_dir, args.output_dir)


if __name__ == '__main__':
    main()

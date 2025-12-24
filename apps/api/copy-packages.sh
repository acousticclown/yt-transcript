#!/bin/bash
# Copy packages folder from monorepo root into apps/api
# This script runs during Railway build

# Try different possible locations
if [ -d ../../packages ]; then
  echo "Found packages at ../../packages"
  mkdir -p packages
  cp -r ../../packages/* packages/
  echo "Copied packages folder"
elif [ -d ../packages ]; then
  echo "Found packages at ../packages"
  mkdir -p packages
  cp -r ../packages/* packages/
  echo "Copied packages folder"
elif [ -d ../../../packages ]; then
  echo "Found packages at ../../../packages"
  mkdir -p packages
  cp -r ../../../packages/* packages/
  echo "Copied packages folder"
else
  echo "Warning: Could not find packages folder"
  echo "Current directory: $(pwd)"
  echo "Directory contents:"
  ls -la
  echo "Parent directory:"
  ls -la ..
  echo "Grandparent directory:"
  ls -la ../..
fi


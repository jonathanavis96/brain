#!/bin/bash

# This variable is unused
UNUSED_VAR="never used"

# This variable is used
USED_VAR="hello"
echo "${USED_VAR}"

# Another unused one
ANOTHER_UNUSED="also never used"

# Used in a different way
USED_VAR2="world"
echo "$USED_VAR2"

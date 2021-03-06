# Repeater (Web Frontend)

This is the React web frontend for Repeater

# Usage notes

- Any style or move changes you make will be automatically saved in your browser. If you refresh or close the page and reopen it, you'll see the changes are persisted. If you open the app on another device or if you clear your cache, nothing will be saved
- Click on a move to open it up and optionally add a link that you can use as a reference (e.g. a video of the move). If you set one, the move will have a little icon beside it that you can click to open up the link
- You can also specify whether the item is a combo. If yes, then then after reading out its name, the app will wait using the 'Combo Period' value instead of the 'Simple Period'. This allows you to specify a longer duration to practice combos (which tend to be longer) than simple moves. Note, combos will be shown using a solid border rather than a dotted border

<p align="center">
  <img src="https://user-images.githubusercontent.com/3508147/160731524-7dc09e01-1cea-4f6d-a179-b975d70f054f.png" />
</p>

- The first few items are considered 'prioritized' and will show up more frequently when reading out the moves while practicing


## Selection strategy

- There is a N% chance that the next move will be from the Learning pile, and a 100-N% chance that it will be from the Learned pile, where N is the weight set above the Learning pile
- If it is from the Learned pile, then each item in the pile has an equal chance to get selected
- If it is from the Learning pile, then there is a 50% chance that the item will be from the prioritized subset (golden ones), and 50% chance that it will be from the non-prioritized subset. Within each subset, each item has an equal chance to get selected


# Running locally

- Check out the repository
- Install dependencies with `yarn`
- Run with `yarn start`


# TODO

- Improve the selection strategy. Ultimately the point is to prioritize learning items, and within them to further prioritize a few select ones, but at the same time to not neglect the ones you've already learned. The current approach is not perfect, but roughly gets us there. It definitely has problems with some edge cases (e.g. when there are very few learned items, it actually ends up prioritizing them)
- Add in user support to persist values per user (will probably skip out on this, unless people start using this app)
- Add in some backend authorization. Maybe eventually add user support with credentials, but at least a secret on the backend will suffice
- Add in deployment via Terraform. Maybe this is not needed. Think more on this


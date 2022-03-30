# Repeater
Tool to help you remember dance patterns. Specify a dance style, add moves and combos to the list, and this app will randomly read out items from the list based on periods you set. Initial moves on the list (marked in gold) are prioritized and are read out more often to help you better learn them. As you learn moves, check them off to mark them as 'learned', and they'll go into a separate pile.

[Try it out!](url)

<p align="center">
  <img src="https://user-images.githubusercontent.com/3508147/160730809-2977451b-c97a-46e5-91a1-a15f02c3471e.png" />
</p>


# Usage notes

- Any style or move changes you make will be automatically saved in your browser. If you refresh or close the page and reopen it, you'll see the changes are persisted. If you open the app on another device or if you clear your cache, nothing will be saved
- Click on a move to open it up and optionally add a link that you can use as a reference (e.g. a video of the move). If you set one, the move will have a little icon beside it that you can click to open up the link
- You can also specify whether the item is a combo. If yes, then then after reading out its name, the app will wait using the 'Combo Period' value instead of the 'Simple Period'. This allows you to specify a longer duration to practice combos (which tend to be longer) than simple moves. Note, combos will be shown using a solid border rather than a dotted border

<p align="center">
  <img src="https://user-images.githubusercontent.com/3508147/160731524-7dc09e01-1cea-4f6d-a179-b975d70f054f.png" />
</p>

- The first few items are considered 'prioritized' and will show up more frequently when reading out the moves while practicing


## Selection strategy

- There is a 50% chance that the next move will be from the Learning pile, and a 50% chance that it will be from the Learned pile
- If it is from the Learned pile, then each item in the pile has an equal chance to get selected
- If it is from the Learning pile, then there is a 50% chance that the item will be from the prioritized subset (golden ones), and 50% chance that it will be from the non-prioritized subset. Within each subset, each item has an equal chance to get selected


# TODO

- Add in a backend to persist values remotely
- Add in user support to persist values per user (will probably skip out on this, unless people start using this app)
- Add an infra configuration via Terraform

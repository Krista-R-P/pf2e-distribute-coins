// Entry point for PF2e Distribute Coins module
import { distributeCoinsToParty } from "./scripts/distribute-coins.js";
import { registerDistributeCoinsSocket } from "./scripts/socket.js";
import { setupDistributeButton } from "./scripts/create-button.js";

Hooks.once("ready", () => {
  // Optionally expose the function globally for other modules/macros
  window.pf2eDistributeCoins = { distributeCoinsToParty };
  console.log("PF2e Distribute Coins module loaded.");
  registerDistributeCoinsSocket();
});

Hooks.on(`renderActorSheet`, async (app, html) => {
  if (app.actor.type === 'party') {
    await setupDistributeButton(app, html);
  }
});
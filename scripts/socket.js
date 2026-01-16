// Socket handler for PF2e Distribute Coins module
import { distributeCoinsToParty } from "./distribute-coins.js";

const SOCKET_EVENT = "pf2e-distribute-coins-distribute";

export function registerDistributeCoinsSocket() {
  if (game.user.isGM && !window._pf2eDistributeCoinsSocketRegistered) {
    window._pf2eDistributeCoinsSocketRegistered = true;
    game.socket.on(`module.pf2e-distribute-coins`, async (data) => {
      if (data?.type === SOCKET_EVENT && data.partyActorId) {
        await distributeCoinsToParty(data.partyActorId);
      }
    });
    console.log("PF2e Distribute Coins socket listener registered.");
  }
}

export function emitDistributeCoinsSocket(partyActorId) {
  game.socket.emit(`module.pf2e-distribute-coins`, {
    type: SOCKET_EVENT,
    partyActorId
  });
}

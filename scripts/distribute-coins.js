/**
 * Distribute coins from a party actor to all player characters in the world.
 * @param {string} partyActorId - The ID of the party actor
 */
export async function distributeCoinsToParty(partyActorId) {
    const partyActor = game.actors.get(partyActorId);
    if (!partyActor) return;
    // Select all player characters in the world (not tokens, not minions/eidolons)
    const playerActors = game.actors.contents.filter(
        a => a.hasPlayerOwner && a.type === "character" && !a.isToken && !a.system.traits.value.some((t) => ["minion", "eidolon"].includes(t))
    );
    if (!playerActors.length) {
        ui.notifications.warn("No player characters found to distribute coins.");
        return;
    }
    const playerCount = playerActors.length;
    // Convert all coins to copper
    const partyCoins = partyActor.inventory.coins;
    const totalCopper = (partyCoins.pp * 1000) + (partyCoins.gp * 100) + (partyCoins.sp * 10) + (partyCoins.cp);
    if (totalCopper === 0) {
        ui.notifications.warn("Nothing to distribute");
        return;
    }
    // Remove all coins from the stash using removeCoins
    await partyActor.inventory.removeCoins({
        pp: partyCoins.pp,
        gp: partyCoins.gp,
        sp: partyCoins.sp,
        cp: partyCoins.cp
    });
    // Divide copper evenly among players
    const copperToDistribute = Math.trunc(totalCopper / playerCount);
    const leftoverCopper = totalCopper - (copperToDistribute * playerCount);
    // Distribute coins
    const rawcoinShare = {
        gp: Math.trunc(copperToDistribute / 100),
        sp: Math.trunc((copperToDistribute % 100) / 10),
        cp: copperToDistribute % 10
    };
    const coinShare = {
        gp: rawcoinShare.gp.toLocaleString(),
        sp: rawcoinShare.sp.toLocaleString(),
        cp: rawcoinShare.cp.toLocaleString()
    };
    for (const actor of playerActors) {
        await actor.inventory.addCoins(rawcoinShare);
    }
    // Add leftover copper back to the stash as gp/sp/cp
    let rem = leftoverCopper;
    const leftoverGP = Math.trunc(rem / 100);
    rem = rem % 100;
    const leftoverSP = Math.trunc(rem / 10);
    const leftoverCP = rem % 10;
    // Always set all denominations, even if zero
    let leftoverPP = 0;
    let remLeft = leftoverCopper;
    if (remLeft >= 1000) {
        leftoverPP = Math.trunc(remLeft / 1000);
        remLeft = remLeft % 1000;
    }
    const finalGP = Math.trunc(remLeft / 100);
    remLeft = remLeft % 100;
    const finalSP = Math.trunc(remLeft / 10);
    const finalCP = remLeft % 10;
    await partyActor.inventory.addCoins({
        pp: leftoverPP,
        gp: finalGP,
        sp: finalSP,
        cp: finalCP
    });
    // Prepare data for template
    const recipients = playerActors.map(a => ({ id: a.id }));
    // Calculate total distributed coins in gold pieces (to 2 decimals)
    const totalDistributedGP = (copperToDistribute * playerCount / 100).toFixed(2);
    const templateData = {
        coinShare,
        rawcoinShare,
        partyActor: { id: partyActor.id },
        recipients,
        totalDistributedGP
    };
    // Render template and send chat message
    const message = await foundry.applications.handlebars.renderTemplate("modules/pf2e-distribute-coins/templates/distribute-coins-message.hbs", templateData);
    ChatMessage.create({
        user: game.user.id,
        style: CONST.CHAT_MESSAGE_STYLES.OTHER,
        content: message,
    });

}

import { emitDistributeCoinsSocket } from "./socket.js";

export async function setupDistributeButton(app, html) {
    // Only show for player users
    if (!game.user.isGM) {
        let currencyDiv = html.find('.currency');
        if (!currencyDiv.length) currencyDiv = html;
        // Render the button template
        const buttonHtml = await renderTemplate("modules/pf2e-distribute-coins/html/distribute-coins.html", {});
        const distributeButton = $(buttonHtml);
        distributeButton.on('click', async (event) => {
            event.preventDefault();
            // Get coins from party actor
            const partyActor = app.actor;
            emitDistributeCoinsSocket(partyActor.id);
        });
        currencyDiv.append(distributeButton);
    }
}
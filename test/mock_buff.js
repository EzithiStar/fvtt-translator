// Normal strings (Should be extracted)
const msg = "You have failed the saving throw!";
const label = 'Attack Bonus';

// Template Literal (Should be extracted?)
const log = `Attacking ${target.name} with ${weapon.name}`;

// Localization Keys (Should be IGNORED)
const key1 = game.i18n.localize("PF1.Error");
const key2 = game.i18n.format("PF1.Message", { name: "Test" });

// Technical strings (Should be IGNORED by regex)
const path = "systems/pf1/templates/chat/attack.html";
const id = "my_module_setting";
const code = "@Item[123456]";

// Dialog content (Should be extracted)
new Dialog({
    title: "Confirmation",
    content: "<p>Are you sure?</p>",
    buttons: {
        yes: {
            label: "Yes",
            callback: () => { }
        }
    }
}).render(true);

// UI Notifications (Should be extracted)
ui.notifications.info("Macro started.");
ui.notifications.warn("No target selected!");

// HTML String
const html = '<div class="red">Danger</div>';

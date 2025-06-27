const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  EmbedBuilder,
  TextInputBuilder,
  TextInputStyle,
  ModalBuilder,
  MessageFlags,
} = require("discord.js");
const fs = require("fs");
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot funcionando");
});
app.listen(process.env.PORT || 8000, () => {
  console.log("Bot encendido 24/7");
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const CHANNELS = {
  manager1: "1388137011633983579", // Canal para Manager del dealer 1
  manager2: "1386844258773893191", // Canal para Manager del dealer 2
  manager3: "1386844331037691914", // Canal para Manager del dealer 3
  manager4: "1382826184747913371", // Canal para Manager del dealer 4
  manager5: "1382826184747913372", // Canal para Manager del dealer 5
};
const AUTH_CODE = "0001"; // Código de autorización
const ROLE_ID = "1379638246031753236"; // Reemplaza con el ID del rol específico
const TASK_IMAGE_URL = "https://i.imgur.com/vyacfRP.png"; // Imagen para encargos iniciales
const COMPLETED_IMAGE_URL = "https://i.imgur.com/vyacfRP.png"; // Imagen para encargos completados
const INITIAL_COOLDOWN = 7400; // 2 horas en segundos
const POINTS_PER_TASK = 1; // Puntos por encargo completado (cambiado a 1)

const MANAGERS = {
  manager1: {
    name: "Manager del dealer paleto",
    iconURL:
      "https://media.istockphoto.com/id/837345268/es/foto/personaje-de-la-pel%C3%ADcula-noir.jpg?s=2048x2048&w=is&k=20&c=L1cFNtCKVTicqxoo00pbm89bKvBk3dM45Ifx8aDAhGY=",
    tasks: {
      finanzas: "Lavado de dinero",
      respeto: "Expulsar alborotadores",
      recursos: "Recolección de paquetes",
    },
    descriptions: {
      finanzas:
        "Señor D. tiene un par de bolsas de dinero que lavar, si quieres seguir haciendo negocios con nosotros encargate de lavar este dinero rapido!",
      respeto:
        "Hay unos canallas queriendo causar problemas, hazlos desaparecer. muevete.",
      recursos:
        "Necesitamos que entregues unos paquetes los mas rapido posible ven y hazlo rapido.",
    },
    finish: {
      finanzas: "Bien hecho, has limpiado todo ese dinero exitosamente",
      respeto: "Bien hecho, has expulsado a los alborotadores.",
      recursos: "Bien hecho, has entregado los paquetes debidamente.",
    },
  },
  manager2: {
    name: "Manager del dealer burro",
    iconURL:
      "https://media.istockphoto.com/id/837345268/es/foto/personaje-de-la-pel%C3%ADcula-noir.jpg?s=2048x2048&w=is&k=20&c=L1cFNtCKVTicqxoo00pbm89bKvBk3dM45Ifx8aDAhGY=",
    tasks: {
      finanzas: "Lavado de dinero",
      respeto: "Expulsar alborotadores",
      recursos: "Recolección de paquetes",
    },
    descriptions: {
      finanzas:
        "Señor D. tiene un par de bolsas de dinero que lavar, si quieres seguir haciendo negocios con nosotros encargate de lavar este dinero rapido!",
      respeto:
        "Hay unos canallas queriendo causar problemas, hazlos desaparecer. muevete.",
      recursos:
        "Necesitamos que entregues unos paquetes los mas rapido posible ven y hazlo rapido.",
    },
    finish: {
      finanzas: "Bien hecho, has limpiado todo ese dinero exitosamente",
      respeto: "Bien hecho, has expulsado a los alborotadores.",
      recursos: "Bien hecho, has entregado los paquetes debidamente.",
    },
  },
  manager3: {
    name: "Manager del dealer grandsenora",
    iconURL:
      "https://media.istockphoto.com/id/837345268/es/foto/personaje-de-la-pel%C3%ADcula-noir.jpg?s=2048x2048&w=is&k=20&c=L1cFNtCKVTicqxoo00pbm89bKvBk3dM45Ifx8aDAhGY=",
    tasks: {
      finanzas: "Lavado de dinero",
      respeto: "Expulsar alborotadores",
      recursos: "Recolección de paquetes",
    },
    descriptions: {
      finanzas:
        "Señor D. tiene un par de bolsas de dinero que lavar, si quieres seguir haciendo negocios con nosotros encargate de lavar este dinero rapido!",
      respeto:
        "Hay unos canallas queriendo causar problemas, hazlos desaparecer. muevete.",
      recursos:
        "Necesitamos que entregues unos paquetes los mas rapido posible ven y hazlo rapido.",
    },
    finish: {
      finanzas: "Bien hecho, has limpiado todo ese dinero exitosamente",
      respeto: "Bien hecho, has expulsado a los alborotadores.",
      recursos: "Bien hecho, has entregado los paquetes debidamente.",
    },
  },
  manager4: {
    name: "Manager del dealer 4",
    iconURL: "https://example.com/manager4-avatar.png",
    tasks: {
      finanzas: "Lavado de dinero",
      respeto: "Expulsar alborotadores",
      recursos: "Recolección de paquetes",
    },
    descriptions: {
      finanzas:
        "Señor D. tiene un par de bolsas de dinero que lavar, si quieres seguir haciendo negocios con nosotros encargate de lavar este dinero rapido!",
      respeto:
        "Hay unos canallas queriendo causar problemas, hazlos desaparecer. muevete.",
      recursos:
        "Necesitamos que entregues unos paquetes los mas rapido posible ven y hazlo rapido.",
    },
    finish: {
      finanzas: "Bien hecho, has limpiado todo ese dinero exitosamente",
      respeto: "Bien hecho, has expulsado a los alborotadores.",
      recursos: "Bien hecho, has entregado los paquetes debidamente.",
    },
  },
  manager5: {
    name: "Manager del dealer 5",
    iconURL: "https://example.com/manager5-avatar.png",
    tasks: {
      finanzas: "Lavado de dinero",
      respeto: "Expulsar alborotadores",
      recursos: "Recolección de paquetes",
    },
    descriptions: {
      finanzas:
        "Señor D. tiene un par de bolsas de dinero que lavar, si quieres seguir haciendo negocios con nosotros encargate de lavar este dinero rapido!",
      respeto:
        "Hay unos canallas queriendo causar problemas, hazlos desaparecer. muevete.",
      recursos:
        "Necesitamos que entregues unos paquetes los mas rapido posible ven y hazlo rapido.",
    },
    finish: {
      finanzas: "Bien hecho, has limpiado todo ese dinero exitosamente",
      respeto: "Bien hecho, has expulsado a los alborotadores.",
      recursos: "Bien hecho, has entregado los paquetes debidamente.",
    },
  },
};

let activeTasks = {};
let cooldowns = {};
let pendingSelections = {}; // Declaración corregida
let completedMessages = {}; // Para rastrear mensajes de completado

function loadScores() {
  try {
    const data = fs.readFileSync("scores.json", "utf8");
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

function saveScores(scores) {
  fs.writeFileSync("scores.json", JSON.stringify(scores, null, 2));
}

function loadCooldowns() {
  try {
    const data = fs.readFileSync("cooldown.js", "utf8");
    const loadedCooldowns = JSON.parse(data);
    Object.keys(MANAGERS).forEach((manager) => {
      cooldowns[manager] = loadedCooldowns[manager] || {};
    });
  } catch (error) {
    Object.keys(MANAGERS).forEach((manager) => {
      cooldowns[manager] = {};
    });
  }
}

function saveCooldowns() {
  fs.writeFileSync("cooldown.js", JSON.stringify(cooldowns, null, 2));
}

client.once("ready", () => {
  console.log(`Bot conectado como ${client.user.tag}`);
  Object.keys(MANAGERS).forEach((manager) => {
    activeTasks[manager] = {};
    cooldowns[manager] = {};
  });
  loadCooldowns();
  initializeTasks();
  setInterval(updateCooldowns, 1000); // Reducir 1 segundo cada segundo
});

function initializeTasks() {
  Object.entries(MANAGERS).forEach(([manager, data]) => {
    const managerChannelId = CHANNELS[manager];
    const managerChannel = client.channels.cache.get(managerChannelId);
    if (!managerChannel) {
      console.error(
        `Canal no encontrado para ${manager} con ID ${managerChannelId}`,
      );
      return;
    }

    Object.entries(data.tasks).forEach(([taskType, taskName]) => {
      if (
        !activeTasks[manager][taskType] ||
        (cooldowns[manager][taskType] && cooldowns[manager][taskType] <= 0)
      ) {
        // Intentar borrar el mensaje de completado anterior
        if (completedMessages[manager] && completedMessages[manager][taskType]) {
          managerChannel.messages
            .fetch(completedMessages[manager][taskType])
            .then((message) => message.delete().catch(console.error))
            .catch(console.error);
          delete completedMessages[manager][taskType];
        }

        const embed = new EmbedBuilder()
          .setColor("#808080")
          .setAuthor({ name: data.name, iconURL: data.iconURL })
          .setTitle(taskName)
          .setDescription(
            `${data.descriptions[taskType]}\n\n Tipo: ${taskType} \nHaz clic en el botón para marcar como completado.\n <@&${ROLE_ID}>`,
          )
          .setImage(TASK_IMAGE_URL);
        const button = new ButtonBuilder()
          .setCustomId(`complete_${manager}_${taskType}`)
          .setLabel("Completar")
          .setStyle(ButtonStyle.Primary);

        managerChannel
          .send({
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents(button)],
          })
          .then((message) => {
            activeTasks[manager][taskType] = {
              messageId: message.id,
              timestamp: Date.now(),
            };
            console.log(
              `Mensaje inicializado para ${taskName} (tipo ${taskType}) por ${data.name} en canal ${managerChannelId} con ID ${message.id}`,
            );
          })
          .catch((error) =>
            console.error(
              `Error al enviar mensaje para ${taskName} por ${data.name} en canal ${managerChannelId}:`,
              error,
            ),
          );
      }
    });
  });
}

function updateCooldowns() {
  Object.entries(MANAGERS).forEach(([manager, data]) => {
    Object.keys(cooldowns[manager]).forEach((taskType) => {
      if (cooldowns[manager][taskType] > 0) {
        cooldowns[manager][taskType] -= 1;
        console.log(
          `Reduciendo cooldown para ${data.tasks[taskType]} a ${cooldowns[manager][taskType]} segundos por ${data.name}`,
        );
        saveCooldowns();
      } else if (cooldowns[manager][taskType] === 0) {
        console.log(
          `Cooldown terminado para ${data.tasks[taskType]} (tipo ${taskType}) por ${data.name}, reiniciando...`,
        );
        delete cooldowns[manager][taskType];
        saveCooldowns();
        delete activeTasks[manager][taskType];
        initializeTasks();
      }
    });
  });
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith("!iniciar")) {
    const args = message.content.split(" ");
    if (args.length !== 2 || args[1] !== AUTH_CODE) {
      await message.reply({
        content: "Código incorrecto o formato inválido.",
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    initializeTasks();
    await message.reply({
      content: "Encargos inicializados con éxito.",
      flags: [MessageFlags.Ephemeral],
    });
  }

  if (message.content.startsWith("!mantenimientos")) {
    const args = message.content.split(" ");
    if (args.length !== 2) {
      await message.reply({
        content: "Uso correcto: !mantenimientos [usuario]",
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    const targetUserId = args[1].replace(/[<@!>]/g, "");
    const scores = loadScores();
    const userScores = scores[targetUserId] || {
      finanzas: 0,
      respeto: 0,
      recursos: 0,
    };

    const embed = new EmbedBuilder()
      .setColor("#808080")
      .setTitle(
        `Mantenimientos hechos de ${await client.users.fetch(targetUserId).then((user) => user.username)}`,
      )
      .addFields(
        {
          name: "💰 ENCARGO DE LAVADO DE DINERO",
          value: `**Hechos: ${userScores.finanzas || 0}**`,
          inline: true,
        },
        {
          name: "🛡️ EXPULSAR ALBOROTADORES",
          value: `**Hechos: ${userScores.respeto || 0}**`,
          inline: true,
        },
        {
          name: "📦 RECOLECCIÓN DE PAQUETES",
          value: `**Hechos: ${userScores.recursos || 0}**`,
          inline: true,
        },
      );

    await message.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
  }
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId.startsWith("complete_")) {
      const [_, manager, taskType] = interaction.customId.split("_");
      console.log(`Botón presionado - Manager: ${manager}, Tarea: ${taskType}`); // Depuración
      if (!MANAGERS[manager]) {
        console.error(`Manager ${manager} no encontrado`);
        await interaction.reply({
          content: "Error: Manager no válido.",
          flags: [MessageFlags.Ephemeral],
        });
        return;
      }
      const guild = interaction.guild;
      await guild.members.fetch().catch(console.error);

      const members = guild.members.cache
        .filter((member) => !member.user.bot)
        .sort((a, b) => a.displayName.localeCompare(b.displayName));

      const options = members
        .map((member) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(member.displayName)
            .setValue(member.user.id),
        )
        .slice(0, 24);

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`select_members_${manager}_${taskType}`)
        .setPlaceholder("Selecciona los miembros")
        .setMinValues(1)
        .setMaxValues(options.length)
        .addOptions(options);

      await interaction.reply({
        content: "Selecciona los miembros que completaron el encargo:",
        components: [new ActionRowBuilder().addComponents(selectMenu)],
        flags: [MessageFlags.Ephemeral],
      });
    }
  }

  if (interaction.isStringSelectMenu()) {
    if (interaction.customId.startsWith("select_members_")) {
      console.log(`CustomId recibido: ${interaction.customId}`); // Depuración adicional
      const parts = interaction.customId.split("_");
      const [_, __, manager, taskType] = parts; // Ignora los dos primeros segmentos (select, members)
      console.log(
        `Menú seleccionado - Manager: ${manager}, Tarea: ${taskType}`,
      ); // Depuración
      if (!MANAGERS[manager] || !MANAGERS[manager].tasks[taskType]) {
        console.error(`Manager ${manager} o tarea ${taskType} no válida`);
        await interaction.reply({
          content: "Error: Tarea no válida.",
          flags: [MessageFlags.Ephemeral],
        });
        return;
      }
      const selectedUserIds = interaction.values;
      pendingSelections[interaction.user.id] = {
        manager,
        taskType,
        userIds: selectedUserIds,
      };

      const modal = new ModalBuilder()
        .setCustomId(`percentage_${manager}_${taskType}`)
        .setTitle(`Porcentaje para ${MANAGERS[manager].tasks[taskType]}`);

      const percentageInput = new TextInputBuilder()
        .setCustomId("percentage_input")
        .setLabel("Ingresa el porcentaje completado (0-100)")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(percentageInput),
      );

      await interaction.showModal(modal);
    }
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId.startsWith("percentage_")) {
      const [_, manager, taskType] = interaction.customId.split("_");
      console.log(`Modal enviado - Manager: ${manager}, Tarea: ${taskType}`); // Depuración
      if (!MANAGERS[manager] || !MANAGERS[manager].tasks[taskType]) {
        console.error(`Manager ${manager} o tarea ${taskType} no válida`);
        await interaction.reply({
          content: "Error: Tarea no válida.",
          flags: [MessageFlags.Ephemeral],
        });
        return;
      }
      const percentage = parseInt(
        interaction.fields.getTextInputValue("percentage_input"),
      );
      const userId = interaction.user.id;
      const { userIds } = pendingSelections[userId] || {};

      if (isNaN(percentage) || percentage < 0 || percentage > 100) {
        await interaction.reply({
          content: "Porcentaje inválido. Debe estar entre 0 y 100.",
          flags: [MessageFlags.Ephemeral],
        });
        return;
      }

      const taskName = MANAGERS[manager].tasks[taskType];
      const userMentions = userIds
        ? userIds.map((id) => `<@${id}>`).join(", ")
        : "ninguno";

      // Cargar y actualizar scores
      let scores = loadScores();
      userIds.forEach((userId) => {
        scores[userId] = scores[userId] || {
          finanzas: 0,
          respeto: 0,
          recursos: 0,
        };
        scores[userId][taskType] += POINTS_PER_TASK;
      });
      saveScores(scores);

      const channel = client.channels.cache.get(CHANNELS[manager]);
      if (!channel) {
        console.error(
          `Canal no encontrado para ${manager} con ID ${CHANNELS[manager]}`,
        );
        await interaction.reply({
          content: "Error: Canal no accesible.",
          flags: [MessageFlags.Ephemeral],
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor("#808080")
        .setAuthor({
          name: MANAGERS[manager].name,
          iconURL: MANAGERS[manager].iconURL,
        })
        .setTitle("ENCARGO COMPLETADO")
        .setDescription(
          `${MANAGERS[manager].finish[taskType]}\nLos miembros ${userMentions} hicieron el encargo ${taskName} \n** ahora el dealer tiene un ${percentage}% de ${taskType}. **` +
            `\n**Esta misión volverá a estar disponible <t:${Math.floor((Date.now() + INITIAL_COOLDOWN * 1000) / 1000)}:R>.**`,
        )
        .setImage(COMPLETED_IMAGE_URL);

      const completedMessage = await channel.send({ embeds: [embed] });
      completedMessages[manager] = completedMessages[manager] || {};
      completedMessages[manager][taskType] = completedMessage.id;

      cooldowns[manager][taskType] = INITIAL_COOLDOWN;
      saveCooldowns();
      const message = await channel.messages.fetch(
        activeTasks[manager][taskType].messageId,
      );
      if (message) await message.delete().catch(console.error);
      delete activeTasks[manager][taskType];
      delete pendingSelections[userId];
      await interaction.update({
        content: "Encargo registrado con éxito.",
        components: [],
        flags: [MessageFlags.Ephemeral],
      });
    }
  }
});

client.login(
  "MTM4ODE3NjI2ODE0MjMxMzU3NQ.GoeuUi.TRHzhuHlFWj8iPGy7MA5gJvRR5MhJWT3FQ4DAY",);

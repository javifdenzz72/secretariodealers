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
  "MTM4MjczMTY3NDExODI1ODc2OQ.GCq9OY.Z3_-vUv_E1lLAb3K4eK3ezWz6oA3WjCfXjjS7w",
);

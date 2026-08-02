"use strict";

(function defineDeckConfigs() {
  const sharedAssetsBase = "../../assets";

  function cardFiles(folder, numbers) {
    return numbers.map(number => `${folder}/${number}.png`);
  }

  function numberRange(start, end) {
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  function categoryMap(ranges) {
    return ranges.reduce((map, [category, numbers]) => {
      numbers.forEach(number => {
        map[`${number}.png`] = category;
      });
      return map;
    }, {});
  }

  const miniGuideNumbers = [1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  const beforeTheBlendNumbers = [1, ...numberRange(4, 27)];
  const fullDeckNumbers = [
    1,
    ...numberRange(5, 19),
    ...numberRange(21, 35),
    ...numberRange(37, 51),
    ...numberRange(53, 67),
    ...numberRange(69, 83),
    ...numberRange(85, 99)
  ];

  window.BLENDED_BOND_DECKS = {
    "mini-guide": {
      productName: "Mini Guide",
      storageKey: "blendedBondSavedPromptsDeck1",
      assetsBase: sharedAssetsBase,
      sharedAssetsBase,
      cardImageFiles: cardFiles("miniguide", miniGuideNumbers),
      cardCategories: {
        "1.png": "Start",
        "4.png": "Connection",
        "5.png": "Connection",
        "6.png": "Connection",
        "7.png": "Growth",
        "8.png": "Growth",
        "9.png": "Growth",
        "10.png": "Trust",
        "11.png": "Trust",
        "12.png": "Trust",
        "13.png": "Together"
      },
      categoryOrder: ["connection", "growth", "trust", "together"]
    },

    "full-deck": {
      productName: "Blended Bond",
      storageKey: "blendedBondSavedPromptsDeck2",
      assetsBase: sharedAssetsBase,
      sharedAssetsBase,
      cardImageFiles: cardFiles("fulldeck", fullDeckNumbers),
      cardCategories: categoryMap([
        ["Start", [1]],
        ["Connection", numberRange(5, 19)],
        ["Action", numberRange(21, 35)],
        ["Fun Card", numberRange(37, 51)],
        ["Growth", numberRange(53, 67)],
        ["Trust", numberRange(69, 83)],
        ["Take Away", numberRange(85, 99)]
      ]),
      categoryOrder: ["connection", "action", "fun-card", "growth", "trust", "take-away"],
      categoryDefinitions: [
        { name: "Connection", symbol: "Connection", icon: "element5.png", description: "Emphasize emotional bonding, creating strong relationships, and fostering understanding between family members." },
        { name: "Action", symbol: "Action", icon: "Element 316.png", description: "Focus on practical steps, decisions, and things that need to be done in the family for improvement." },
        { name: "Fun Card", symbol: "Fun Card", icon: "Element 330.png", description: "Activities families can do together to strengthen their bond and create lasting memories." },
        { name: "Growth", symbol: "Growth", icon: "Element 332.png", description: "Focus on individual and family development, personal growth, and how to foster improvement in the family dynamic." },
        { name: "Trust", symbol: "Trust", icon: "Element 329.png", description: "Focus on building and maintaining trust within the family, ensuring safety, security, and mutual respect." },
        { name: "Take Away", symbol: "Take Away", icon: "element4.png", description: "Reflect on lessons learned, reflections on what's been experienced, and what can be carried forward." }
      ]
    },

    "before-the-blend": {
      productName: "Before the Blend",
      storageKey: "blendedBondSavedPromptsDeck3",
      assetsBase: sharedAssetsBase,
      sharedAssetsBase,
      cardImageFiles: cardFiles("beforetheblend", beforeTheBlendNumbers),
      cardCategories: categoryMap([
        ["Start", [1]],
        ["Trust", numberRange(4, 7)],
        ["Connection", numberRange(8, 11)],
        ["Growth", numberRange(12, 15)],
        ["Action", numberRange(16, 19)],
        ["Takeaway", numberRange(20, 23)],
        ["Together", numberRange(24, 27)]
      ]),
      categoryOrder: ["trust", "connection", "growth", "action", "takeaway", "together"],
      categoryDefinitions: [
        { name: "Trust", symbol: "Trust", icon: "Element 329.png", description: "Focus on creating emotional safety, honesty, and reliability between partners before blending family life." },
        { name: "Connection", symbol: "Connection", icon: "element5.png", description: "Support deeper conversations that help you understand each other's values, parenting hopes, and relationship needs." },
        { name: "Growth", symbol: "Growth", icon: "Element 332.png", description: "Invite reflection on what each partner is learning, healing, and practicing as you prepare for this next chapter." },
        { name: "Action", symbol: "Action", icon: "Element 316.png", description: "Turn the conversation into practical next steps, shared decisions, and agreements that support your future blended family." },
        { name: "Takeaway", symbol: "Takeaway", icon: "element4.png", description: "Pause to name what stood out, what you want to remember, and what should carry forward into your relationship." },
        { name: "Together", symbol: "Together", icon: "Element 315.png", description: "Explore how you want to show up as a couple, make room for your children, and build a family rhythm together." }
      ]
    }
  };
})();

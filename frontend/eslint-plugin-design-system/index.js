// Custom ESLint rules for Design System compliance
const designSystemRules = {
  "no-hardcoded-colors": {
    meta: {
      type: "problem",
      docs: {
        description: "Disallow hardcoded color values in className",
        category: "Design System",
        recommended: true,
      },
      fixable: "code",
      schema: [],
      messages: {
        hardcodedColor:
          "Avoid hardcoded colors like '{{color}}'. Use design system colors instead (e.g., 'bg-primary-500', 'text-secondary-700').",
        suggestedFix: "Consider using design system color: {{suggestion}}",
      },
    },
    create(context) {
      // Design system approved colors - these should NOT be flagged
      const designSystemColors = [
        "primary",
        "secondary",
        "accent",
        "neutral",
        "success",
        "error",
        "warning",
        "info",
        "grade-excellent",
        "grade-good",
        "grade-average",
        "grade-poor",
      ];

      // Common hardcoded color patterns (excludes design system colors)
      const hardcodedColorPatterns = [
        // Tailwind hardcoded colors (NOT in design system)
        /\b(bg|text|border|ring|shadow)-(red|blue|green|yellow|purple|pink|indigo|gray|slate|zinc|stone|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-(50|100|200|300|400|500|600|700|800|900)\b/g,
        // Hex colors
        /#[0-9a-fA-F]{3,6}/g,
        // RGB colors
        /rgb\([\d\s,]+\)/g,
        // HSL colors
        /hsl\([\d\s,%]+\)/g,
      ];

      function suggestDesignSystemColor(hardcodedColor) {
        if (hardcodedColor.includes("red")) return "error";
        if (hardcodedColor.includes("green")) return "success";
        if (hardcodedColor.includes("yellow")) return "warning";
        if (hardcodedColor.includes("blue")) return "primary";
        if (
          hardcodedColor.includes("gray") ||
          hardcodedColor.includes("neutral")
        )
          return "neutral";
        return "primary";
      }

      return {
        JSXAttribute(node) {
          if (node.name.name !== "className") return;

          const value = node.value;
          if (
            value &&
            value.type === "Literal" &&
            typeof value.value === "string"
          ) {
            const className = value.value;

            hardcodedColorPatterns.forEach((pattern) => {
              const matches = className.match(pattern);
              if (matches) {
                matches.forEach((match) => {
                  // Check if this color is from our design system
                  const isDesignSystemColor = designSystemColors.some(color => 
                    match.includes(color)
                  );
                  
                  // Only report if it's NOT a design system color
                  if (!isDesignSystemColor) {
                    const suggestion = suggestDesignSystemColor(match);
                    context.report({
                      node: value,
                      messageId: "hardcodedColor",
                      data: {
                        color: match,
                        suggestion: `${match.split("-")[0]}-${suggestion}-500`,
                      },
                    });
                  }
                });
              }
            });
          }
        },
      };
    },
  },

  "use-design-tokens": {
    meta: {
      type: "suggestion",
      docs: {
        description: "Encourage usage of design system tokens",
        category: "Design System",
        recommended: true,
      },
      schema: [],
      messages: {
        preferDesignTokens:
          "Consider using design system tokens from @/design-system instead of arbitrary values.",
      },
    },
    create(context) {
      return {
        JSXAttribute(node) {
          if (node.name.name !== "className") return;

          const value = node.value;
          if (
            value &&
            value.type === "Literal" &&
            typeof value.value === "string"
          ) {
            const className = value.value;

            // Check for arbitrary values [color:#ff0000]
            if (className.includes("[") && className.includes("]")) {
              context.report({
                node: value,
                messageId: "preferDesignTokens",
              });
            }
          }
        },
      };
    },
  },
};

module.exports = {
  rules: designSystemRules,
  configs: {
    recommended: {
      plugins: ["design-system"],
      rules: {
        "design-system/no-hardcoded-colors": "error",
        "design-system/use-design-tokens": "warn",
      },
    },
  },
};

#!/usr/bin/env -S npx tsx

/**
 * Script to create a new Cursor skill
 *
 * Usage:
 *   pnpm run create-skill --folder=tests --m="Testing skill description" [--scope="hooks,stores"]
 */

import { writeFile, mkdir, readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";

interface SkillOptions {
  folder: string;
  message: string;
  name?: string;
  scope?: string[];
}

interface SkillInfo {
  folder: string;
  name: string;
  description: string;
  scope?: string[];
}

function parseArgs(): SkillOptions {
  const args = process.argv.slice(2);
  const folderArg = args.find((arg) => arg.startsWith("--folder="));
  const messageArg = args.find((arg) => arg.startsWith("--m="));
  const nameArg = args.find((arg) => arg.startsWith("--name="));
  const scopeArg = args.find((arg) => arg.startsWith("--scope="));

  if (!folderArg || !messageArg) {
    console.error(
      'Usage: pnpm run create-skill --folder=[folder-name] --m="[description]" [--scope="hooks,stores"]',
    );
    process.exit(1);
  }

  const folder = folderArg.split("=")[1];
  const message = messageArg.split("=")[1].replace(/^["']|["']$/g, "");
  const name = nameArg?.split("=")[1] || `SKILL.md`;

  // Parse scope: --scope="hooks,stores" or --scope="[hooks,stores]"
  let scope: string[] | undefined;
  if (scopeArg) {
    const scopeValue = scopeArg.split("=")[1].replace(/^["'[\]]|["'[\]]$/g, "");
    scope = scopeValue
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return { folder, message, name, scope };
}

function generateSkillContent(
  name: string,
  description: string,
  scope?: string[],
): string {
  const skillName = name.toLowerCase().replace(/\s+/g, "-");
  const scopeLine = scope?.length ? `\nscope: [${scope.join(",")}]` : "";

  return `---
name: ${skillName}
description: ${description}${scopeLine}
---

# ${name}

## Instructions

${description}

## Examples

Add examples here...

## Important Notes

- Add important notes here
`;
}

async function parseSkillFile(filePath: string): Promise<SkillInfo | null> {
  try {
    const content = await readFile(filePath, "utf-8");
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

    if (!frontmatterMatch) return null;

    const frontmatter = frontmatterMatch[1];
    const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
    const descMatch = frontmatter.match(/^description:\s*(.+)$/m);
    const scopeMatch = frontmatter.match(/^scope:\s*\[([^\]]*)\]$/m);

    if (!nameMatch || !descMatch) return null;

    const folder = filePath.split("/").slice(-2, -1)[0];

    return {
      folder,
      name: nameMatch[1].trim(),
      description: descMatch[1].trim(),
      scope: scopeMatch
        ? scopeMatch[1]
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
    };
  } catch {
    return null;
  }
}

async function getAllSkills(): Promise<SkillInfo[]> {
  const skillsDir = join(".cursor", "skills");
  const skills: SkillInfo[] = [];

  try {
    const entries = await readdir(skillsDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillFile = join(skillsDir, entry.name, "SKILL.md");
        if (existsSync(skillFile)) {
          const info = await parseSkillFile(skillFile);
          if (info) skills.push(info);
        }
      }
    }
  } catch {
    // Skills directory doesn't exist yet
  }

  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

function generateAgentSkillsSection(skills: SkillInfo[]): string {
  const skillLines = skills.map((skill) => {
    const scopeNote = skill.scope?.length
      ? ` (scope: ${skill.scope.join(", ")})`
      : "";
    return `- **${skill.name}**${scopeNote}: ${skill.description}`;
  });

  return `## Agent Skills

This project includes Cursor agent skills located in \`.cursor/skills/\`.

Skills may include a \`scope\` field in their frontmatter that lists related skills to consider reading. When a skill has scope, check those related skills for additional context.

### Available Skills

${skillLines.join("\n")}

These skills are automatically applied when working with their respective domains. Refer to the individual skill files for detailed guidance and examples.

## Creating Skills

Create new skills with:

\`\`\`bash
pnpm run create-skill --folder=my-skill --m="Description of the skill" [--scope="hooks,stores"]
\`\`\`

This generates a \`SKILL.md\` in \`.cursor/skills/my-skill/\` with the proper frontmatter and automatically updates this file.`;
}

function generateSkillsReadme(skills: SkillInfo[]): string {
  const skillLines = skills.map((skill) => {
    const scopeNote = skill.scope?.length
      ? ` (scope: ${skill.scope.join(", ")})`
      : "";
    return `- **${skill.name}**${scopeNote}: ${skill.description}`;
  });

  return `# Cursor Skills

These skills are read **automatically** by:

1. **MCPs** - Read directly from \`.cursor/skills/\`

## How do they work?

### In Cursor

- Agents automatically read \`SKILL.md\` files in \`.cursor/skills/\`
- They use the frontmatter description to decide when to apply each skill
- They follow the instructions in the skill content

## Structure

Each skill must have:

- A directory with the skill name
- A \`SKILL.md\` file with YAML frontmatter and markdown content

\`\`\`txt
.cursor/skills/
├── components-ui/
│   └── SKILL.md
├── api-routes/
│   └── SKILL.md
└── ...
\`\`\`

## Frontmatter

\`\`\`yaml
---
name: skill-name
description: Description that helps the agent decide when to use this skill
scope: [related-skill1,related-skill2]
---
\`\`\`

### Scope

The \`scope\` field is optional and lists related skills that should be considered when using this skill. When a skill has scope, the agent should check those related skills for additional context and rules.

Example: \`components-ui\` has \`scope: [stores,testing]\` because when creating components, you might need to understand how to use stores and how to write tests for them.

## Available Skills

${skillLines.join("\n")}
`;
}

async function updateSkillsReadme(skills: SkillInfo[]): Promise<void> {
  const readmePath = join(".cursor", "skills", "README.md");
  const newContent = generateSkillsReadme(skills);

  await writeFile(readmePath, newContent, "utf-8");
  console.log("✓ Updated .cursor/skills/README.md with skills list");
}

async function updateAgentMd(skills: SkillInfo[]): Promise<void> {
  const agentPath = "AGENTS.md";

  if (!existsSync(agentPath)) {
    console.warn("⚠ AGENTS.md not found, skipping update");
    return;
  }

  const content = await readFile(agentPath, "utf-8");

  // Find and replace the Agent Skills section (matches from ## Agent Skills to end of file or next ## that's not Agent/Available/Creating)
  const skillsSectionRegex = /## Agent Skills[\s\S]*$/;
  const newSkillsSection = generateAgentSkillsSection(skills);

  let newContent: string;
  if (skillsSectionRegex.test(content)) {
    newContent = content.replace(skillsSectionRegex, newSkillsSection);
  } else {
    // Append if section doesn't exist
    newContent = `${content.trim()}\n\n${newSkillsSection}`;
  }

  await writeFile(agentPath, newContent, "utf-8");
  console.log("✓ Updated AGENTS.md with skills list");
}

async function formatCode(): Promise<void> {
  try {
    execSync("pnpm run lint", { stdio: "inherit" });
  } catch (error) {
    console.error(
      `Error formatting code: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    process.exit(1);
  }
}

async function createSkill() {
  const { folder, message, name = "SKILL.md", scope } = parseArgs();

  const skillPath = join(".cursor", "skills", folder);
  const skillFile = join(skillPath, name);

  // Check if skill already exists
  if (existsSync(skillFile)) {
    console.error(`Skill already exists at ${skillFile}`);
    console.error("Delete it first or use a different folder name.");
    process.exit(1);
  }

  // Create directory if it doesn't exist
  await mkdir(skillPath, { recursive: true });

  // Generate skill content
  const content = generateSkillContent(folder, message, scope);

  // Write skill file
  await writeFile(skillFile, content, "utf-8");

  console.log(`✓ Created skill: ${folder}`);
  console.log(`  Location: ${skillFile}`);
  console.log(`  Description: ${message}`);
  if (scope?.length) {
    console.log(`  Scope: ${(scope || []).join(", ")}`);
  }

  // Update docs with all skills
  const allSkills = await getAllSkills();
  await updateAgentMd(allSkills);
  await updateSkillsReadme(allSkills);
  await formatCode();

  console.log("\nYou can now edit the skill file to add more details.");
}

createSkill().catch((error) => {
  console.error("Error creating skill:", error);
  process.exit(1);
});

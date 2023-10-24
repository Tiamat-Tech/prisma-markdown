import { DMMF } from "@prisma/generator-helper";

export namespace MermaidWriter {
    export const write = (chapter: DMMF.Model[]) =>
        [
            "```mermaid",
            "erDiagram",
            ...chapter.map(writeTable),
            ...chapter
                .map((model) =>
                    model.fields
                        .filter((f) => f.kind === "object")
                        .map(writeRelationship({ group: chapter, model })),
                )
                .flat()
                .filter((str) => !!str.length),
            "```",
        ].join("\n");

    const writeTable = (model: DMMF.Model): string =>
        [
            `${JSON.stringify(model.dbName ?? model.name)} {`,
            ...model.fields
                .filter((f) => f.kind !== "object")
                .map(writeField(model))
                .map((str) => `    ${str}`),
            "}",
        ].join("\n");

    const writeField =
        (model: DMMF.Model) =>
        (field: DMMF.Field): string =>
            [
                field.type, // type
                field.dbName ?? field.name, // name
                field.isId
                    ? "PK"
                    : model.fields.some(
                          (f) =>
                              f.kind === "object" &&
                              f.relationFromFields?.[0] === field.name,
                      )
                    ? "FK"
                    : field.isUnique
                    ? "UK"
                    : "", // constraint
                field.isRequired ? "" : `"nullable"`, // nullable
            ]
                .filter((str) => !!str.length)
                .join(" ");

    const writeRelationship =
        (props: { group: DMMF.Model[]; model: DMMF.Model }) =>
        (field: DMMF.Field): string => {
            if (!field.relationFromFields?.length) return "";

            const column: string = field.relationFromFields[0];
            const scalar: DMMF.Field | undefined = props.model.fields.find(
                (s) => column === s.dbName || column === s.name,
            );
            if (scalar === undefined) return "";

            const target: DMMF.Model | undefined = props.group.find(
                (t) => t.name === field.type,
            );
            if (target === undefined) return "";

            const oneToOne: boolean = scalar.isId || scalar.isUnique;
            const arrow: string = [
                oneToOne ? "|" : "}",
                !scalar.isRequired ||
                (oneToOne &&
                    props.group.some(
                        (m) =>
                            m.name === field.type &&
                            m.fields.some(
                                (f) =>
                                    f.relationName === field.relationName &&
                                    !f.isRequired,
                            ),
                    ))
                    ? "o"
                    : "|",
                "--",
                props.model === target ? "o" : "|",
                "|",
            ].join("");
            return [
                JSON.stringify(props.model.dbName ?? props.model.name),
                arrow,
                JSON.stringify(target.dbName ?? target.name),
                ":",
                field.name,
            ].join(" ");
        };
}

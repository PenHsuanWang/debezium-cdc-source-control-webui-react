import React from "react";
import { JSONSchema7 } from "json-schema";
import Form, { IChangeEvent } from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

type Props = {
  schema: JSONSchema7;
  formData: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  showAdvanced: boolean;
};

export default function SchemaForm({
  schema,
  formData,
  onChange,
  showAdvanced
}: Props) {
  // Break the schema into sections
  const sections = Object.entries(schema.properties || {});

  const renderSection = (key: string, sectionSchema: JSONSchema7) => {
    const isBasic = key === "BASIC";
    if (!isBasic && !showAdvanced) return null;

    return (
      <Accordion key={key} defaultExpanded={isBasic}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">
            {sectionSchema.title ?? key.replace(/^ADVANCED__/, "")}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Form
            schema={sectionSchema as JSONSchema7}
            formData={formData}
            onChange={(e: IChangeEvent) => onChange({ ...formData, ...e.formData })}
            validator={validator}
            liveValidate
            noHtml5Validate
          >
            <Box />
          </Form>
        </AccordionDetails>
      </Accordion>
    );
  };

  return <>{sections.map(([k, v]) => renderSection(k, v as JSONSchema7))}</>;
}

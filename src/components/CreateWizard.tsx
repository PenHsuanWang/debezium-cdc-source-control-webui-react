import React, { useState } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Box,
  Button,
  CircularProgress,
  Switch,
  FormControlLabel,
  MenuItem,
  InputLabel,
  FormControl,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { JSONSchema7 } from "json-schema";
import SchemaForm from "./SchemaForm";
import { useHost } from "../context/HostContext";
import { createConnector } from "../utils/api";

const STEPS = ["Connector type", "Properties", "Review"];

export default function CreateWizard() {
  const { state } = useHost();
  const host = state.host;
  const [step, setStep] = useState(0);
  const [connectorType, setConnectorType] = useState<string | null>(null);
  const [schema, setSchema] = useState<JSONSchema7 | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loadingSchema, setLoadingSchema] = useState(false);

  /** ---- Step 0 --------------------------------------------------------- */
  const pickType = (t: string) => {
    setConnectorType(t);
    setLoadingSchema(true);
    import(`../templates/${t.toLowerCase()}.schema.json`)
      .then((mod) => setSchema(mod.default))
      .catch((e) => console.error("schema load", e))
      .finally(() => {
        setLoadingSchema(false);
        setStep(1);
      });
  };

  /** ---- Step 1 --------------------------------------------------------- */
  const renderPropertiesStep = () => {
    if (loadingSchema || !schema) return <CircularProgress />;
    return (
      <Box>
        <FormControlLabel
          control={
            <Switch
              checked={showAdvanced}
              onChange={(e) => setShowAdvanced(e.target.checked)}
            />
          }
          label="Show advanced"
        />
        <SchemaForm
          schema={schema}
          formData={formData}
          onChange={setFormData}
          showAdvanced={showAdvanced}
        />
      </Box>
    );
  };

  /** ---- Step 2 --------------------------------------------------------- */
  const renderReview = () => (
    <pre style={{ maxHeight: 400, overflow: "auto" }}>
      {JSON.stringify(formData, null, 2)}
    </pre>
  );

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const submit = async () => {
    await createConnector(host, formData as Record<string, unknown>);
  };

  /** -------------------------------------------------------------------- */
  return (
    <Box>
      <Stepper activeStep={step} sx={{ mb: 4 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {step === 0 && (
        <ConnectorTypePicker selected={connectorType} onSelect={pickType} />
      )}

      {step === 1 && renderPropertiesStep()}
      {step === 2 && renderReview()}

      <Box sx={{ mt: 3 }}>
        <Button disabled={step === 0} onClick={back}>
          Back
        </Button>
        {step < 2 && (
          <Button
            variant="contained"
            disabled={step === 0 && !connectorType}
            onClick={next}
          >
            Next
          </Button>
        )}
        {step === 2 && (
          <Button variant="contained" color="success" onClick={submit}>
            Create connector
          </Button>
        )}
      </Box>
    </Box>
  );
}

type PickerProps = {
  selected: string | null;
  onSelect: (t: string) => void;
};
const CONNECTOR_TYPES = [
  "MongoDB",
  "MySQL",
  "Oracle",
  "PostgreSQL",
  "SQLServer",
  "Cassandra",
];

function ConnectorTypePicker({ selected, onSelect }: PickerProps) {
  const handle = (e: SelectChangeEvent<string>) => onSelect(e.target.value);
  return (
    <FormControl fullWidth>
      <InputLabel id="conn-type-label">Connector type</InputLabel>
      <Select
        labelId="conn-type-label"
        value={selected ?? ""}
        label="Connector type"
        onChange={handle}
      >
        {CONNECTOR_TYPES.map((t) => (
          <MenuItem key={t} value={t}>
            {t}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

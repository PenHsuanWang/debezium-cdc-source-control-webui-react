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
  SelectChangeEvent
} from "@mui/material";
import SchemaForm from "./SchemaForm";
import { useHost } from "../context/HostContext";
import { createConnector } from "../utils/api";

const STEPS = ["Connector type", "Properties", "Review"];

export default function CreateWizard() {
  const { state } = useHost();
  const host = state.host;
  const [step, setStep] = useState(0);
  const [connectorType, setConnectorType] = useState<string | null>(null);
  const [schema, setSchema] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loadingSchema, setLoadingSchema] = useState(false);

  /** Step 0: Connector type selection */
  const handleTypeSelect = (event: SelectChangeEvent<string>) => {
    const t = event.target.value;
    setConnectorType(t);
    setLoadingSchema(true);
    import(`../templates/${t.toLowerCase()}.schema.json`)
      .then((mod) => setSchema(mod.default))
      .catch((e) => console.error("Schema load error:", e))
      .finally(() => {
        setLoadingSchema(false);
        setStep(1);
      });
  };

  /** Step 1: Properties form */
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

  /** Step 2: Review step */
  const renderReviewStep = () => (
    <pre style={{ maxHeight: 400, overflow: "auto" }}>
      {JSON.stringify(formData, null, 2)}
    </pre>
  );

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    if (!connectorType) return;
    try {
      await createConnector(host, connectorType, formData as Record<string, unknown>);
      window.dispatchEvent(new Event('refresh-connectors'));
    } catch (e) {
      console.error("Create connector failed:", e);
    }
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
        <ConnectorTypePicker selected={connectorType} onSelect={handleTypeSelect} />
      )}

      {step === 1 && renderPropertiesStep()}
      {step === 2 && renderReviewStep()}

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
          <Button variant="contained" color="success" onClick={handleSubmit}>
            Create Connector
          </Button>
        )}
      </Box>
    </Box>
  );
}

type PickerProps = {
  selected: string | null;
  onSelect: (event: SelectChangeEvent<string>) => void;
};
const CONNECTOR_TYPES = [
  "MongoDB",
  "MySQL",
  "Oracle",
  "PostgreSQL",
  "SQLServer",
  "Cassandra"
];

function ConnectorTypePicker({ selected, onSelect }: PickerProps) {
  return (
    <FormControl fullWidth>
      <InputLabel id="conn-type-label">Connector Type</InputLabel>
      <Select
        labelId="conn-type-label"
        value={selected ?? ""}
        label="Connector Type"
        onChange={onSelect}
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

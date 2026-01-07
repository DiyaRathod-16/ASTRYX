# Opus Workflow Definitions

This directory contains the Opus workflow engine definitions for ASTRYX anomaly processing.

## Workflow Types

### 1. Anomaly Processing Workflow
- **File**: `anomaly-processing.yml`
- **Purpose**: Main workflow for processing detected anomalies
- **Steps**: Intake → AI Analysis → Verification → Decision → Response

### 2. Emergency Response Workflow
- **File**: `emergency-response.yml`
- **Purpose**: Fast-track workflow for critical severity anomalies
- **Steps**: Immediate Assessment → Auto-Escalation → Notification

### 3. Data Ingestion Workflow
- **File**: `data-ingestion.yml`
- **Purpose**: Scheduled data collection from external sources
- **Steps**: Fetch → Parse → Validate → Store → Notify

## Workflow States
- `pending` - Workflow created but not started
- `running` - Workflow currently executing
- `awaiting_human` - Paused waiting for human input
- `completed` - Successfully finished
- `failed` - Encountered an error
- `cancelled` - Manually cancelled

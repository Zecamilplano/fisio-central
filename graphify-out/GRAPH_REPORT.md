# Graph Report - fisio-central  (2026-10-27)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 608 nodes · 1415 edges · 33 communities (29 shown, 4 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 82 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d1d6921f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29

## God Nodes (most connected - your core abstractions)
1. `react` - 32 edges
2. `lucide-react` - 31 edges
3. `useSchedulingSessions()` - 26 edges
4. `createClient()` - 25 edges
5. `ListPatient` - 23 edges
6. `useEvolutionForm()` - 23 edges
7. `date-fns` - 21 edges
8. `useFisioStore` - 19 edges
9. `useRegisterPatient()` - 18 edges
10. `EditPatientModal()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `ListPatient()` --calls--> `PatientDetails()`  [EXTRACTED]
  src/app/(patient)/listar-pacientes/page.tsx → src/components/patient/list/patientDetails.tsx
- `PatientDetails()` --calls--> `EditPatientModal()`  [EXTRACTED]
  src/components/patient/list/patientDetails.tsx → src/components/patient/list/editPatientModal.tsx
- `PatientDetails()` --calls--> `usePackageSession()`  [EXTRACTED]
  src/components/patient/list/patientDetails.tsx → src/hook/usePackageSession.ts
- `PatientDetails()` --calls--> `useFisioStore`  [EXTRACTED]
  src/components/patient/list/patientDetails.tsx → src/store/fisio/fisioStore.ts
- `handleSavePatientProfile()` --calls--> `updatePatientProfile()`  [EXTRACTED]
  src/components/patient/list/patientDetails.tsx → src/services/patients/patientRepository.ts

## Import Cycles
- 3-file cycle: `src/components/patient/list/index.ts -> src/components/patient/list/selectedPatient.tsx -> src/components/patient/list/patientDetails.tsx -> src/components/patient/list/index.ts`
- 3-file cycle: `src/data/optionsSessionsData.ts -> src/types/index.ts -> src/types/session.ts -> src/data/optionsSessionsData.ts`
- 4-file cycle: `src/data/optionsSessionsData.ts -> src/types/index.ts -> src/types/listPatientType.ts -> src/types/session.ts -> src/data/optionsSessionsData.ts`
- 4-file cycle: `src/data/index.ts -> src/data/registerPatientData.ts -> src/types/index.ts -> src/types/listPatientType.ts -> src/data/index.ts`
- 4-file cycle: `src/data/index.ts -> src/data/schedulingData.ts -> src/types/index.ts -> src/types/listPatientType.ts -> src/data/index.ts`
- 4-file cycle: `src/data/index.ts -> src/data/listPatient.ts -> src/types/index.ts -> src/types/listPatientType.ts -> src/data/index.ts`
- 5-file cycle: `src/data/index.ts -> src/data/listPatient.ts -> src/utils/sessions/mockCreateSession.ts -> src/types/index.ts -> src/types/listPatientType.ts -> src/data/index.ts`

## Communities (33 total, 4 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (49): date-fns, lucide-react, tailwind-variants, EvolutionIcon(), EvolutionIconProps, Evolution, EvolutionSaveData, PatientContactGrid() (+41 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (62): react, EvolutionExerciseSection(), handleAddButtonClick(), handleAddExercise(), handleClearExercises(), handleExerciseKeyDown(), EvolutionExerciseSectionProps, ExerciseField (+54 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (42): zustand, useSessionStatus(), changeFinishStatus(), changePaymentStatus(), changeSessionFinish(), changeSessionPayment(), UseSessionStatusProps, SessionFieldValue (+34 more)

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (39): react-toastify, useSessionCreation(), addSeparateSession(), addSessionToCurrentPackage(), createNextPackage(), createPackageSessions(), getLastPackageSessionDate(), UseSessionCreationProps (+31 more)

### Community 4 - "Community 4"
Cohesion: 0.14
Nodes (21): SchedulingSessions(), buildInitialSchedulingForm(), useSchedulingSessions(), clearError(), handleAddSessions(), handleClearSessions(), handleDateChange(), handleDayToggle() (+13 more)

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (22): devDependencies, autoprefixer@^10.4.24, postcss@^8.5.6, prettier@^3.8.3, tailwindcss@^4.2.0, @tailwindcss/postcss@^4, @types/node@^20, @types/react@^19 (+14 more)

### Community 6 - "Community 6"
Cohesion: 0.14
Nodes (17): ListPatient(), PatientEmptyState(), highlightSearch(), PatientSidebar(), SubHeaderPatientList, getFixedWeekDays(), getPatientsForList(), PatientRow (+9 more)

### Community 7 - "Community 7"
Cohesion: 0.11
Nodes (15): AddSessionModal(), handleConfirmSeparateSession(), handleContinueCurrentPackage(), handleCreateNextPackage(), handleSaveComplete(), AddSessionModalProps, weekDayNumber, SessionOptions() (+7 more)

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (11): characterLimits, EditPatientModal(), handleSubmit(), EditPatientModalProps, FormErrors, getGlobalScheduleDefaults(), normalizedPatient(), sameWeekDays() (+3 more)

### Community 9 - "Community 9"
Cohesion: 0.16
Nodes (15): RegisterPatient(), clearRegistrationDraft(), handleRegisterAndAdd(), handleRegisterAndViewPatient(), Profile(), ProfileProps, LineStep(), StepBall() (+7 more)

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 11 - "Community 11"
Cohesion: 0.16
Nodes (14): TypeOfService(), TypeOfServiceProps, InitialStep, serviceTypeOptionsData, summaryCardData, totalNumberSession, serviceFormData, summaryCardType (+6 more)

### Community 12 - "Community 12"
Cohesion: 0.18
Nodes (13): paymentInitialOptions, SchedulingSessionsProps, currentDate, currentWeekDay, initialErrors, schedulingFormData, Package, PaymentType (+5 more)

### Community 13 - "Community 13"
Cohesion: 0.20
Nodes (11): FirstRegistration(), fieldOrder, FirstRegistrationErrors, FirstRegistrationField, FirstRegistrationValues, initialValues, useFirstRegistration(), handleBlur() (+3 more)

### Community 14 - "Community 14"
Cohesion: 0.21
Nodes (10): handlePhotoChange(), SubHeaderFormRegister(), supportedImageTypes, useImageInput(), handleFileChange(), selectImage(), imageType, SubHeaderFormRegisterType (+2 more)

### Community 15 - "Community 15"
Cohesion: 0.22
Nodes (10): LayoutPatient(), PatientContext, PatientContextType, PatientProvider(), useGlobalPatient(), PatientAddressType, PatientOptionalType, PatientType (+2 more)

### Community 16 - "Community 16"
Cohesion: 0.19
Nodes (6): nextConfig, next@16.1.6, next, updateSession(), config, proxy()

### Community 17 - "Community 17"
Cohesion: 0.18
Nodes (5): useSessionSelection(), clearSelection(), handleSelectAllSessions(), selectAllSessions(), usePackageSession()

### Community 18 - "Community 18"
Cohesion: 0.18
Nodes (11): dependencies, date-fns@^4.1.0, lucide-react@^0.575.0, react@19.2.3, react-number-format@^5.4.5, react-toastify@^11.1.0, @supabase/supabase-js@^2.118.0, tailwind-variants@^3.3.1 (+3 more)

### Community 19 - "Community 19"
Cohesion: 0.25
Nodes (10): ContentSection(), ContentSectionProps, EvolutionView(), EvolutionViewProps, ListContent(), ListContentProps, PainValue(), PainValueProps (+2 more)

### Community 20 - "Community 20"
Cohesion: 0.29
Nodes (6): metadata, montserrat, opensans, RootLayout(), Logo(), Header()

### Community 21 - "Community 21"
Cohesion: 0.47
Nodes (7): useRegisterPatient(), handleNext(), createPatient(), getPatientById(), getPatientServiceById(), savePatientTreatment(), scrollToFirstError()

### Community 22 - "Community 22"
Cohesion: 0.25
Nodes (4): listPatientData, dayToIndex, Session_, dayMap

### Community 23 - "Community 23"
Cohesion: 0.29
Nodes (5): react-calendar@^6.0.1, react-dom@19.2.3, react-calendar, react-dom, Props

### Community 24 - "Community 24"
Cohesion: 0.29
Nodes (4): HasTriedNextType, StepContext, StepContextType, StepKey

### Community 25 - "Community 25"
Cohesion: 0.47
Nodes (4): @supabase/ssr@^0.12.7, @supabase/ssr, signInDevUser(), createClient()

### Community 26 - "Community 26"
Cohesion: 0.60
Nodes (4): useFormTypeService(), handleChange(), validate(), validateFormTypeService()

### Community 27 - "Community 27"
Cohesion: 0.50
Nodes (4): scripts, build, dev, start

### Community 28 - "Community 28"
Cohesion: 0.67
Nodes (3): useFormProfile(), handleErrors(), validateAllFields()

## Knowledge Gaps
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 17`, `Community 18`, `Community 21`, `Community 23`, `Community 24`?**
  _High betweenness centrality (0.199) - this node is a cross-community bridge._
- **Are the 15 inferred relationships involving `useSchedulingSessions()` (e.g. with `handleAddSessions()` and `handleChange()`) actually correct?**
  _`useSchedulingSessions()` has 15 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `Community 0` to `Community 1`, `Community 2`, `Community 5`, `Community 8`, `Community 9`, `Community 11`, `Community 12`, `Community 14`, `Community 18`, `Community 19`, `Community 23`?**
  _High betweenness centrality (0.109) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05485232067510549 - nodes in this community are weakly interconnected._
- **Why does `useSchedulingSessions()` connect `Community 4` to `Community 12`, `Community 21`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07197763801537387 - nodes in this community are weakly interconnected._
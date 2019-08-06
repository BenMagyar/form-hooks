import { useEffect, useRef, useState } from 'react';

const warnOnMissingName = (f: string) =>
  console.warn(`${f} called without a "name" on input`);

export type FormHookErrors<Values> = {
  [Key in keyof Values]?: Values[Key] extends object
    ? FormHookErrors<Values[Key]>
    : string
};

export type FormHookTouched<Values> = {
  [Key in keyof Values]?: Values[Key] extends object
    ? FormHookErrors<Values[Key]>
    : boolean
};

export type FormHookValues = {
  [field: string]: any;
};

export type FormHookDependencies<Values> = (
  options: FormHookOptions<Values>
) => (FormHookOptions<Values>[keyof FormHookOptions<Values>] | any)[];

export interface FormHookOptions<Values> {
  /**
   * Initial form values
   */
  initialValues: Values;
  /**
   * Subimssion handler
   */
  onSubmit: (values: Values) => void;
  /**
   * Validation check that occurs prior to the submission handler.
   */
  validate: (
    values: Values
  ) => FormHookErrors<Values> | Promise<FormHookErrors<Values>>;
  /**
   * Indicates if the form should re-validate the input on blur.
   */
  validateOnBlur?: boolean;
  /**
   * Indicates if the form should be re-validated on input change. Only
   * fired when all fields have been touched that exist within the
   * `initialValues` object.
   */
  validateOnChange?: boolean;
}

export interface FormHookState<Values> {
  /**
   * Map of field names and the error of that field
   */
  errors: FormHookErrors<Values>;
  /**
   * Map of field names and if they have been touched
   */
  touched: FormHookTouched<Values>;
  /**
   * Map of field names and their values
   */
  values: FormHookValues;
  /**
   * Blur handler, marks a field as `touched`
   */
  handleBlur: (event: React.ChangeEvent<any>) => void;
  /**
   * Change handler, changes the field in the `values` state
   */
  handleChange: (event: React.ChangeEvent<any>) => void;
  /**
   * Submission handler, handle calling validation prior to the submission
   * handler, and manging the `touched`, `errors` and `isSubmitting` state.
   */
  handleSubmit: (event: React.ChangeEvent<HTMLFormElement>) => Promise<void>;
  /**
   * Sets additional errors on the forms state
   */
  setErrors: (errors: FormHookErrors<Values>) => void;
  /**
   * Reset form to initial state
   */
  resetForm: () => void;
  /**
   * Reset a value to its initial state, along with its error and touched state.
   */
  resetValue: (value: keyof Values, shouldResetTouched?: boolean) => void;
  /**
   * Indicates if the form is currently submitting
   */
  isSubmitting: boolean;
  /**
   * Number of times the form has been submittied
   */
  submitCount: number;
}

/**
 * Default value for form-hook dependencies
 */
const noDependencies = () => [];

export function useForm<Values>(
  options: FormHookOptions<Values>,
  dependencies: FormHookDependencies<Values> = noDependencies
): FormHookState<Values> {
  const {
    initialValues,
    onSubmit,
    validate,
    validateOnBlur = true,
    validateOnChange = true,
  } = options;
  const initialRender = useRef(true);

  const [errors, setErrors] = useState({});
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  function resetValue(
    value: keyof Values,
    shouldResetTouched: boolean = false
  ) {
    const { [value]: _, ...nextErrors } = errors;
    const nextValues = { ...values, [value]: initialValues[value] };
    setErrors(nextErrors);
    setValues(nextValues);
    if (shouldResetTouched) {
      const { [value]: __, ...nextTouched } = touched;
      setTouched(nextTouched);
    }
  }

  function resetForm() {
    setErrors({});
    setValues(initialValues);
    setTouched({});
    setIsSubmitting(false);
    setSubmitCount(0);
  }

  // Reinitialize the form when a listed dependency changes
  useEffect(() => {
    if (!initialRender.current) {
      resetForm();
    }
    initialRender.current = false;
  }, dependencies(options));

  function value(event: React.ChangeEvent<any>) {
    // normalize values as Formik would
    // https://github.com/jaredpalmer/formik/blob/348f44a3016113d6e2b70db714739804ad0ed4c4/src/Formik.tsx#L321
    const { checked, type, value } = event.target;
    if (/number|range/.test(type)) {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? '' : parsed;
    } else if (/checkbox/.test(type)) {
      return checked;
    }
    return value;
  }

  function handleValidate(nextValues?: Values) {
    return Promise.resolve(validate(nextValues || values)).then(errors =>
      setErrors(errors)
    );
  }

  function shouldValidate(touchedFields: string[]): boolean {
    const initialFields = Object.keys(initialValues);
    return initialFields.every(f => touchedFields.indexOf(f) > -1);
  }

  function handleBlur(event: React.ChangeEvent<any>): void {
    const { name } = event.target;

    if (!name) {
      warnOnMissingName('handleBlur');
    }

    setTouched({ ...touched, [name]: true });

    if (validateOnBlur) {
      if (shouldValidate([...Object.keys(touched), name])) {
        handleValidate();
      }
    }
  }

  function handleChange(event: React.ChangeEvent<any>): void {
    const { name } = event.target;

    if (!name) {
      warnOnMissingName('handleChange');
    }

    const nextValues = { ...values, [name]: value(event) };
    setValues(nextValues);

    if (validateOnChange && shouldValidate(Object.keys(touched))) {
      // No guarantee the update has completed, provide the values
      // for the update instead
      handleValidate(nextValues);
    }
  }

  function handleSubmit(event: React.ChangeEvent<any>): Promise<void> {
    event.preventDefault();

    setIsSubmitting(true);
    setSubmitCount(submitCount + 1);

    const fields = [...Object.keys(values), ...Object.keys(initialValues)];
    setTouched(Object.assign({}, ...fields.map(k => ({ [k]: true }))));

    return Promise.resolve(validate(values))
      .then(errors => {
        setErrors(errors);
        if (!Object.keys(errors).length) {
          return Promise.resolve(onSubmit(values));
        }
        return Promise.resolve();
      })
      .then(() => setIsSubmitting(false))
      .catch(error => {
        setIsSubmitting(false);
        return Promise.reject(error);
      });
  }

  return {
    errors,
    touched,
    values,
    handleBlur,
    handleChange,
    handleSubmit,
    setErrors,
    resetForm,
    isSubmitting,
    submitCount,
    resetValue,
  };
}

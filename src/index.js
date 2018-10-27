import { useState } from 'react';

const warnOnMissingName = f => `${f} called without a "name" on input`;

export function useForm({
    initialValues,
    onSubmit,
    validate,
}) {
    const [errors, setErrors] = useState({});
    const [values, setValues] = useState(initialValues);
    const [touched, setTouched] = useState({});
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitCount, setSubmitCount] = useState(0);

    function value(field) {
        // normalize values as Formik would
        // https://github.com/jaredpalmer/formik/blob/348f44a3016113d6e2b70db714739804ad0ed4c4/src/Formik.tsx#L321
        const { checked, type, value } = field;
        return /number|range/.test(type)
            ? ((parsed = parseFloat(value)), isNaN(parsed) ? '' : parsed)
            : /checkbox/.test(type) ? checked : value;
    }

    function handleBlur(event) {
        const { name } = event.target;

        if (!name) {
            warnOnMissingName("handleBlur");
        }

        setTouched({ ...touched, [name]: true }, () => {
            validateField(value(event.target))
        });
    }

    function handleChange(event) {
        const { name } = event.target;

        if (!name) {
            warnOnMissingName("handleChange");
        }
        
        setValues({ ...values, [name]: value(event.target) });
    }

    function handleSubmit(event) {
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
            })
            .then(() => setIsSubmitting(false))
            .catch(error => { 
                setIsSubmitting(false)
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
        isSubmitting,
        submitCount,
    }
}
import React from 'react';
import { useForm } from 'form-hooks';

export default () => {
    const {
        errors,
        touched,
        values,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitting,
    } = useForm({
        initialValues: {
            name: '',
            email: '',
        },
        onSubmit: values => alert(JSON.stringify(values)),
        validate: values => ({
            ...(!values.name.length ? { name: 'Requires a name' } : {}),
            ...(!values.email.length ? { email: 'Requires an email' } : {})
        }),
    });

    return (
        <form onSubmit={handleSubmit}>
            <input name="name" 
                   type="text" 
                   value={values.name} 
                   onChange={handleChange}
                   onBlur={handleBlur}
            />
            {touched['name'] && errors['name']}
            <input name="email"
                   type="text" 
                   value={values.email} 
                   onChange={handleChange}
                   onBlur={handleBlur}
            />
            {touched['email'] && errors['email']}
            <button type="submit" disabled={isSubmitting}>submit</button>
        </form>
    )
}
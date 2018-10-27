# form-hooks

Easily create forms in React components -- with hooks! Essentially 
a dumbed down version of [Formik][] using hooks. There are definitely 
some missing cases here (for instance resetting the form on value changes, 
per field validation and validation on blur) 🤷‍♂️.

## Getting Started

```bash
npm install form-hooks
```

```js
import { useForm } from 'form-hooks';

const Sample = () => (
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
        onSubmit: values => fetch(/* with values */),
        validate: values => ({
            ...(!values.name.length ? { name: 'Requires a name' } : {}),
            ...(!values.name.length ? { name: 'Requires an email' } : {})
        }),
    });

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" 
                   value={values.name} 
                   onChange={handleChange}
                   onBlur={handleBlur}
            />
            {touched['name'] && errors['name']}
            <input type="text" 
                   value={values.name} 
                   onChange={handleChange}
                   onBlur={handleBlur}
            />
            {touched['email'] && errors['email']}
            <button type="submit" disabled={submitting}>submit</button>
        </form>
    )
)
```

[Formik]: https://github.com/jaredpalmer/formik 
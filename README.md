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
)
```

## Documentation

### `useForm` - `options`

The `useForm` hook takes some options (as an object) to initialize state 
and manage form validation/submissions.

#### `initialValues`

An object with the forms initial values. These values should not be required.

#### `onSubmit(values)`

Called when a form is submitted with the values set. Only called if validation
passes. 

#### `validate(values)`

Called when a form is submitted prior to the `onSubmit` call. Returns an object 
of errors similar to `Formik`.

### `useForm` - returned

#### `errors`

An object that contains the form errors where the key is the field name 
and the value is the error message.

#### `touched`

An object that contains which form fields have been touched. The key is 
the field name, the value is a boolean of if the field has been touched.

#### `values`

An object that contains all of the values of the form. Initialized with the 
`initialValues` originally passed in. Modified by the `handleChange` handler.

#### `handleBlur`

Marks a field as `touched` to show errors after all fields are touched.

#### `handleChange`

Changes the fields value in the `values` state.

#### `handleSubmit`

Handles calling validation prior to the `onSubmit` handler and setting the
`touched`, `errors` and `isSubmitting` state internally.

#### `isSubmitting`

Boolean value if the form is currently submitting.

#### `setErrors`

Function that allows for errors to be set outside of the `useForm`
internal handlers (good for handling request errors).

[Formik]: https://github.com/jaredpalmer/formik 
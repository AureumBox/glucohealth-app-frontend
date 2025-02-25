import { IonInput, IonButton } from '@ionic/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useFormik} from 'formik'
import { useHistory } from 'react-router'
import { PreregisterDto } from '~/features/patients/dto/preregister'
import { QUERY_KEYS } from '~/features/patients/constants'
import { patientPreregisterSchema } from '~/features/patients/schemas/preregister'
import { preregisterPatient } from '~/features/patients/services/preregister'
import { ROUTES } from '~/shared/constants/routes'
import { encrypt } from '~/shared/utils/aes-encryption'
import { Checkbox } from "@mui/material"

export function PreregisterForm() {
  const history = useHistory()

  const queryClient = useQueryClient()  

  const preregisterMutation = useMutation({
    mutationFn: (values: PreregisterDto) => {
      return preregisterPatient(values)
    },
    onSuccess: async data => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PATIENTS_LIST] })

      const encryptedEmail = encrypt(data.email)
      const encryptedPassword = encrypt(data.password)

      history.push(
        `${ROUTES.APP.PATIENTS.PREREGISTER.LOGIN_DATA.PATH}?e=${encryptedEmail}&p=${encryptedPassword}`,
      )
    },
  })

  const { handleChange, handleSubmit, handleBlur, isValid, touched, errors, values } =
        useFormik<PreregisterDto>({
          initialValues: {
            email: '',
            nationalId: '',
            agreeToTerms: false,
          },
          onSubmit: values => {
            preregisterMutation.mutate(values)
          },
          validationSchema: patientPreregisterSchema,
        })

  if (preregisterMutation.isPending) return <h1>Cargando...</h1>

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        handleSubmit()
      }}
      onInput={handleChange}
      onBlur={handleBlur}
      className="flex flex-col w-full justify-center items-center gap-5"
    >
      <IonInput
        name="email"
        fill="outline"
        labelPlacement="stacked"
        type="email"
        errorText={errors.email}
        className={`max-w-xl border-2 rounded-md bg-gray-100 border-gray-200 ${errors.email ? 'ion-invalid' : ''} ${touched.email && 'ion-touched'}`}
        label="Correo Electrónico"
        mode="md"
      />
      <IonInput
        name="nationalId"
        fill="outline"
        labelPlacement="stacked"
        label="Cédula de identidad"
        errorText={errors.nationalId}
        className={`max-w-xl border-2 rounded-md bg-gray-100 border-gray-200  ${errors.nationalId ? 'ion-invalid' : ''} ${touched.nationalId && 'ion-touched'}`}
        mode="md"        
      />
      <div className='items-center mx-4 md:mx-8 lg:mx-16 xl:mx-32'>
        <label>
          <input
            type="checkbox"
            name="agreeToTerms"
            checked={values.agreeToTerms}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          Para utilizar la app web Gluco Health, que facilita el control de la Diabetes Mellitus tipo 2, autorizo el uso de mis datos personales y de salud (como información de contacto, niveles de glucosa y hábitos de bienestar) para seguimiento personalizado, generación de reportes, recordatorios y mejoras del servicio, bajo estricta confidencialidad y conforme a las normativas vigentes. Entiendo que mis datos no serán compartidos con terceros sin mi autorización, salvo por obligación legal, y que si no acepto, no podré usar la aplicación. *
        </label>        
      </div>
      <IonButton disabled={!values.agreeToTerms || !isValid} className="bg-yellow-500 rounded-md" color={'bg-yellow-500'} type="submit">
        Continuar
      </IonButton>
    </form>
  )
}

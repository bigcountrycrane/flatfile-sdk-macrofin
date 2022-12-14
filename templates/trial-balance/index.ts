import {
  BooleanField,
  DateField,
  NumberField,
  OptionField,
  LinkedField,
  Sheet,
  TextField,
  Workbook,
  Message,
} from '@flatfile/configure'

import { Chart_of_Accounts_NetSuite_Extract } from '../chart-of-accounts-netsuite-extract'
import { Subsidiary_NetSuite_Extract } from '../subsidiary-netsuite-extract'
import { SmartDateField } from '../../src/SmartDateField'

export const Trial_Balance = new Sheet(
  'Trial Balance',
  {
    //External ID should be a non-editable field. This will be populated by NetSuite
    externalId: TextField({
      label: 'External ID',
      description: 'This is used to group the transaction lines together.',
      required: false,
      unique: true,
    }),

    //This should be Non Editable field as this will be populated by NetSuite
    tranid: TextField({
      label: 'Tran ID',
      description: 'This is used to group the transaction lines together.',
      required: true,
      unique: true,
      validate: (value) => {
        const regex = new RegExp('', '')
        if (!regex.test(value)) {
          return [new Message('Invalid value', 'error', 'validate')]
        }
      },
    }),

    //This should from the Subsidary List and should populate the Subsidary Name
    Subsidiary: LinkedField({
      label: 'Subsidiary',
      description:
        'This is a reference to the subsidiary which must be created in your Setup > Company > Subsidiaries prior to import.',
      required: true,
      sheet: Subsidiary_NetSuite_Extract,
    }),

    //This should be the internal ID of the Subsidary selected in Column C
    SubsidiaryID: TextField({
      label: 'Subsidiary ID',
      description:
        'This is a reference to the subsidiary which must be created in your Setup > Company > Subsidiaries prior to import.',
      required: false,
      //sheet: Subsidiary_NetSuite_Extract,
    }),

    //This should source from the Currency sheet
    Currency: TextField({
      label: 'Currency',
      description:
        'Enter the transaction currency to be used.  This is a reference to the Currency record which must be created under Lists > Accounting > Currencies prior to import.',
      required: true,
    }),

    // This is a numerical field
    exchangeRate: NumberField({
      label: 'Exchange Rate',
      required: true,
      description:
        'Enter the currency exchange rate as of cutover date for the transaction.  Maximum of 8 decimal places (0.12345678)  Ask your lead consultant for details.',
      annotations: {
        // default: true,
        // defaultMessage: 'Exchange Rate was not provided, it has been set to ',
        compute: true,
        computeMessage:
          'This value was automatically reformatted to eight decimal places. Original value was: ',
      },
      compute: (v: number) => {
        return Number(v.toFixed(8))
      },
    }),

    //Should follow the format  MMM YYYY
    postingPeriod: TextField({
      label: 'Posting Period',
      description:
        'This is the accounting period based on the transaction date.  Formula driven. Do not override.',
    }),

    tranDate: SmartDateField({
      label: 'Tran Date',
      fstring: 'DD/MM/YY',
      required: true,
      description:
        'Enter the transaction date.  This defaults to the date entered on the instruction sheet. Override if needed.',
    }),

    memoHeader: TextField({
      label: 'Memo Header',
      description:
        'You can retain the default memo driven by the formula or enter the actual description of the transaction. ',
      required: true,
      validate: (value) => {
        const regex = new RegExp('^$|^(?=.{1,999}$).*', '')
        if (!regex.test(value)) {
          return [
            new Message(
              'Please enter up to 999 characters.',
              'error',
              'validate'
            ),
          ]
        }
      },
    }),
    // This column should filter from the Charts of Accounts Worksheet
    account: LinkedField({
      label: 'Account',
      required: true,
      description:
        'This is a reference to the GL account against which the amounts have to be posted.    Simply enter the account number of the GL account.  The account must be setup in Lists > Accounting > Accounts prior to import.',
      sheet: Chart_of_Accounts_NetSuite_Extract,
    }),

    //This should be the internal ID of the value set in the account column (column i)
    accountInternalID: TextField({
      label: 'Account Name',
      required: true,
      description:
        '(Lookup Needed) Displays the account name id on the account name.',
    }),

    memoLines: TextField({
      label: 'Memo Lines',
      required: true,
      description:
        'You can retain the default memo driven by the formula or enter the actual description of the transaction line.',
      validate: (value) => {
        const regex = new RegExp('^$|^(?=.{1,999}$).*', '')
        if (!regex.test(value)) {
          return [
            new Message(
              'Please enter up to 999 characters.',
              'error',
              'validate'
            ),
          ]
        }
      },
    }),
    //This should be a numerical value with a maximum of 2 decimal points
    debit: NumberField({
      label: 'Debit',
      description:
        'Enter the debit amount in this field.  Ensure NOT to use a thousand separator on the number format.  Maximum of 2 decimal places.',
      annotations: {
        compute: true,
        computeMessage:
          'This value was automatically reformatted to two decimal places. Original value was: ',
      },
      compute: (v: number) => {
        return Number(v.toFixed(2))
      },
    }),

    credit: NumberField({
      label: 'Credit',
      description:
        'Enter the credit amount in this field.  Ensure NOT to use a thousand separator on the number format.  Maximum of 2 decimal places.',
      annotations: {
        compute: true,
        computeMessage:
          'This value was automatically reformatted to two decimal places. Original value was: ',
      },
      compute: (v: number) => {
        return Number(v.toFixed(2))
      },
    }),

    //This should source from the Department List

    department: TextField({
      label: 'Department',
      description:
        'This should be the #N/A value of the segment.  Formula driven. Do not override.',
    }),

    //This should source from the Class List

    class: TextField({
      label: 'Class',
      description:
        'This should be the #N/A value of the segment.  Formula driven. Do not override.',
    }),

    //This should source from the Location List

    location: TextField({
      label: 'Location',
      description:
        'This should be the #N/A value of the segment.  Formula driven. Do not override.',
    }),
  },
  {
    recordCompute: (record, _session, _logger) => {
      const credit = record.get('credit')
      const debit = record.get('debit')

      if (credit && debit) {
        record.addError(
          'credit',
          'Either credit or debit should be populated per line'
        )
        record.addError(
          'debit',
          'Either credit or debit should be populated per line'
        )
      }
    },
  }
)

import { StyleSheet, Text, View } from 'react-native';
import React, { useContext, useLayoutEffect, useState } from 'react';
import IconButton from '../components/UI/IconButton';
import { GlobalStyles } from '../constants/styles';
import Button from '../components/UI/Button';
import { ExpensesContext } from '../store/expenses-context';
import ExpenseForm from '../components/ManageExpense/ExpenseForm';
import { deleteExpense, storeExpense, updateExpense } from '../util/http';
import LoadingOverlay from '../components/UI/LoadingOverlay';
import ErrorOverlay from '../components/UI/ErrorOverlay';

export default function ManageExpense({ route, navigation }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState();

  const expensesCtx = useContext(ExpensesContext);

  const editeExpenseId = route.params?.expenseId;

  const isEditing = !!editeExpenseId;

  const selectedExpense = expensesCtx.expenses.find(
    expense => expense.id === editeExpenseId
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Επεξεργασία εξόδων' : 'Προσθήκη εξόδων'
    });
  }, [navigation, isEditing]);

  async function deleteExpenseHandler() {
    setIsSubmitting(true);
    try {
      await deleteExpense(editeExpenseId);
      expensesCtx.deleteExpense(editeExpenseId);
      navigation.goBack();
    } catch (error) {
      setError(
        'Δεν είναι δυνατή η διαγραφή του εξόδου - παρακαλώ προσπαθήστε ξανά αργότερα!'
      );
      setIsSubmitting(false);
    }
  }

  function cancelHandler() {
    navigation.goBack();
  }

  async function confirmHandler(expenseData) {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        expensesCtx.updateExpense(editeExpenseId, expenseData);
        await updateExpense(editeExpenseId, expenseData);
      } else {
        const id = await storeExpense(expenseData);
        expensesCtx.addExpense({ ...expenseData, id: id });
      }
      navigation.goBack();
    } catch (error) {
      setError(
        'Δεν είναι δυνατή η αποθήκευση των δεδομένων - παρακαλώ προσπαθήστε ξανά αργότερα!'
      );
      setIsSubmitting(false);
    }
  }

  if (error && !isSubmitting) {
    return <ErrorOverlay message={error} />;
  }

  if (isSubmitting) {
    return <LoadingOverlay />;
  }

  return (
    <View style={styles.container}>
      <ExpenseForm
        submitButtonLabel={isEditing ? 'Ενημέρωση' : 'Προσθήκη'}
        onSubmit={confirmHandler}
        onCancel={cancelHandler}
        defaultValues={selectedExpense}
      />

      {isEditing && (
        <View style={styles.deleteContainer}>
          <IconButton
            icon='trash'
            color={GlobalStyles.colors.error500}
            size={36}
            onPress={deleteExpenseHandler}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: GlobalStyles.colors.primary800
  },

  deleteContainer: {
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: GlobalStyles.colors.primary200,
    alignItems: 'center'
  }
});

<template>
  <div>
    <button @click="addCondition" class="btn"><i class="bi bi-plus-circle"></i> {{ $t('search_view.form_condition') }}</button>

    <div v-for="(condition, index) in queryConditions" :key="index" class="row pt-5">
      <div class="col-md-3">
        <select v-model="condition.column" class="form-control mt-1">
          <option value="">{{ $t('search_view.form_col') }}</option>
          <option v-for="column in availableColumns" :key="column" :value="column">{{ column }}</option>
        </select>
      </div>
      <div class="col-md-3">
        <select v-model="condition.operator" class="form-control mt-1">
          <option value="=">{{ $t('search_view.form_equals') }}</option>
          <option value="!=">{{ $t('search_view.form_not_equals') }}</option>
          <option value="<">{{ $t('search_view.form_less_than') }}</option>
          <option value=">">{{ $t('search_view.form_greater_than') }}</option>
          <option value="<=">{{ $t('search_view.form_less_or_equal') }}</option>
          <option value=">=">{{ $t('search_view.form_greater_or_equal') }}</option>
        </select>
      </div>
      <div class="col-md-3">
        <input v-model="condition.value" type="text" class="form-control mt-1" :placeholder="$t('search_view.form_placeholder_value')" />
      </div>
      <div class="col-md-3">
        <button @click="removeCondition(index)" class="btn btn-danger"><i class="bi bi-trash-fill"></i></button>
      </div>
    </div>
    
  </div>
</template>
  
<script>
  export default {
    props: {
      availableColumns: {
        type: Array,
        required: true
      },
      queryConditions: {
        type: Array,
        required: true
      },
      addCondition: {
        type: Function,
        required: true
      },
      removeCondition: {
        type: Function,
        required: true
      }
    }
  };
</script>
  
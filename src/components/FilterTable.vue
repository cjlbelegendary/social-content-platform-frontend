<template>
  <div class="filter-table-container">
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterModel" class="filter-form">
        <el-form-item
          v-for="field in filterFields"
          :key="field.prop"
          :label="field.label"
        >
          <el-select
            v-if="field.type === 'select'"
            v-model="filterModel[field.prop]"
            :placeholder="field.placeholder || `请选择${field.label}`"
            :clearable="field.clearable !== false"
            :multiple="field.multiple"
            :collapse-tags="field.multiple"
            :collapse-tags-tooltip="field.multiple"
            :style="{ width: field.width || '150px' }"
          >
            <el-option
              v-for="option in field.options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>

          <el-date-picker
            v-else-if="field.type === 'daterange'"
            v-model="dateRangeModel"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            :style="{ width: field.width || '240px' }"
          />

          <el-input
            v-else-if="field.type === 'input'"
            v-model="filterModel[field.prop]"
            :placeholder="field.placeholder || `请输入${field.label}`"
            :clearable="field.clearable !== false"
            :style="{ width: field.width || '150px' }"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch" class="bg-blue-500 hover:bg-blue-600">
            查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="list-card">
      <div v-if="$slots['table-header']" class="table-header">
        <slot name="table-header"></slot>
      </div>

      <el-table
        :data="tableData"
        border
        stripe
        :loading="loading"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
      >
        <el-table-column v-if="selectable" type="selection" width="50" />

        <el-table-column
          v-for="column in columns"
          :key="column.prop"
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :min-width="column.minWidth"
          :align="column.align || 'left'"
          :fixed="column.fixed"
        >
          <template #default="scope">
            <slot
              v-if="$slots[`column-${column.prop}`]"
              :name="`column-${column.prop}`"
              :row="scope.row"
              :$index="scope.$index"
            >
              {{ scope.row[column.prop] }}
            </slot>
            <template v-else>
              {{ scope.row[column.prop] }}
            </template>
          </template>
        </el-table-column>

        <el-table-column v-if="$slots.operation" label="操作" :width="operationWidth" align="center" fixed="right">
          <template #default="scope">
            <slot name="operation" :row="scope.row" :$index="scope.$index"></slot>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="paginationModel.page"
          v-model:page-size="paginationModel.page_size"
          :page-sizes="[10, 20, 50, 100]"
          :total="paginationModel.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  filterFields: {
    type: Array,
    default: () => []
  },
  filterModel: {
    type: Object,
    required: true
  },
  dateRange: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    default: () => []
  },
  tableData: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  pagination: {
    type: Object,
    required: true
  },
  selectable: {
    type: Boolean,
    default: false
  },
  operationWidth: {
    type: [Number, String],
    default: 200
  }
})

const emit = defineEmits([
  'search',
  'reset',
  'selection-change',
  'row-click',
  'update:pagination',
  'update:dateRange'
])

const paginationModel = computed({
  get: () => props.pagination,
  set: (val) => emit('update:pagination', val)
})

const dateRangeModel = computed({
  get: () => props.dateRange,
  set: (val) => emit('update:dateRange', val)
})

const handleSearch = () => {
  emit('search')
}

const handleReset = () => {
  emit('reset')
}

const handleSelectionChange = (selection) => {
  emit('selection-change', selection)
}

const handleRowClick = (row) => {
  emit('row-click', row)
}

const handleSizeChange = (val) => {
  paginationModel.value.page_size = val
  paginationModel.value.page = 1
  emit('search')
}

const handleCurrentChange = (val) => {
  paginationModel.value.page = val
  emit('search')
}
</script>

<style scoped>
.filter-table-container {
  width: 100%;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.list-card {
  padding: 20px;
}

.table-header {
  margin-bottom: 15px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>

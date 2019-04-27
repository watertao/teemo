
export function serializeQueryParameter(paramObj) {
    let queryParamLiteral = '';
    if (paramObj) {
        Object.keys(paramObj).forEach(key => {
            if (paramObj[key] != null) {
                if (queryParamLiteral == '') {
                    queryParamLiteral = `?${key}=${paramObj[key]}`;
                } else {
                    queryParamLiteral += `&${key}=${paramObj[key]}`;
                }
            }
        });
    }
    return queryParamLiteral;
}

export function convertPaginationFilterParam(pagination, originParam) {
    const filterParam = {
        ...(originParam || {}),
        last_cursor: (pagination.current - 1) * pagination.pageSize,
        count: pagination.pageSize,
    };
    return filterParam;
}

export function convertSortFilterParam(sort, originParam) {
    if (sort.field) {
        const filterParam = {
            ...(originParam || {}),
            sort_field: sort.field,
            sort_order: sort.order,
        };
        return filterParam;
    } else {
        return originParam;
    }

}
import React, { PureComponent } from 'react';
import { Tooltip, Icon, Popover } from 'antd';
import PropTypes from "prop-types";
import { connect } from 'dva';
import _ from 'lodash';
import mm from '@/utils/message-util';
import MODULE_SETTINGS from '@tmp/moduleSettings';
import { getResourceByVerbUriPattern } from '@/utils/authority';


let CODE_RESOURCE_CACHE = undefined;


export function AuthorityTreeNodeTitle({ item }) {

  switch(item.nodeType) {
    case 'group':
      return (
        <span>{item.name}</span>
      );
    default:
      return (
        <span onClick={(event) => {
          if (!(event.target.tagName == 'SPAN' && event.target.className == 'ant-popover-open')) {
            event.stopPropagation();
          }
        }}>
          <Popover
            content={_makeMenuTipContent(item)}
            title={<div><span>{item.name}</span></div>}
            placement="right">
            <span>{item.name}</span>
          </Popover>
        </span>
      );

  };

}


export function AuthorityTreeNodeCheckbox(item) {
  const { nodeType } = item;
  switch (nodeType) {
    case 'module':
      return (!(item.resources) || item.resources.length == 0);
    case 'event':
      return (!(item.resources) || item.resources.length == 0);
    default:
      return false;
  }
}


export function AuthorityTreeNodeIcon({ item: { nodeType }}) {
  switch(nodeType) {
    case 'module':
      return <Icon type="layout" theme="filled" style={{fontSize: '13px'}} />;
    case 'event':
      return <Icon type="youtube" theme="filled" style={{fontSize: '13px'}} />;
    default:
      return <Icon type="layout" style={{fontSize: '13px'}} />
  }
}




function _makeMenuTipContent(item) {
  _makeModuleSettingCache();
  const resources = CODE_RESOURCE_CACHE[item.code];
  return (
    <div style={{ width: '300px' }}>
      {
        resources.length == 0 ? (
          <div style={{fontSize: '11px'}}>( empty )</div>):
          resources.map((resource, index) => _makeResourceItem(resource, index, resources.length)
        )
      }
    </div>
  );
}

function _makeResourceItem(resource, index, totalCnt) {
  if (resource.unRecognize) {

    return (
      <div key={resource.pattern} style={{
        marginBottom: '4px',
        borderBottom: ((index == (totalCnt - 1) ? '0px' : '1px') + ' solid #f5f5f5'),
        paddingBottom: (index == (totalCnt - 1) ? '0px' : '2px')
      }}>
        <Tooltip placement="left" title={'无法识别此资源'}>
          <Icon style={{fontSize: '12px', color: '#faad14', marginRight: '8px'}} type="exclamation-circle" theme="filled" />
          <span style={{background: '#fffbe6', height: '16px', lineHeight: '16px', fontStyle: 'italic', fontSize: '11px'}}>{resource.pattern}</span>
        </Tooltip>
      </div>
    )
  } else {
    return (
      <div key={resource.id} style={{
        marginBottom: '4px',
        borderBottom: ((index == (totalCnt - 1) ? '0px' : '1px') + ' solid #f5f5f5'),
        paddingBottom: (index == (totalCnt - 1) ? '0px' : '2px')
      }}>
        <Tooltip placement="left" title={resource.name}>
        <div style={{height: '17px', lineHeight: '17px', verticalAlign: 'middle'}}>{_makeMenuTipContentVerbTag(resource.verb)}<span style={{height: '16px', lineHeight: '16px', fontStyle: 'italic', fontSize: '11px', verticalAlign:'middle'}}> {resource.uri_pattern}</span></div>
        </Tooltip>
      </div>
    );
  }
}


function _makeMenuTipContentVerbTag(verb) {
  switch(verb) {
    case 'DELETE':
      return <span style={{ backgroundColor: '#F50', height: '16px', lineHeight: '16px', fontSize: '11px', color: '#FFF', fontWeight: '700', paddingLeft: '2px', paddingRight: '2px', borderRadius: '2px' }}>{ verb }</span>;
    case 'GET':
      return <span style={{ backgroundColor: '#87D068', height: '16px', lineHeight: '16px', fontSize: '11px', color: '#FFF', fontWeight: '700', paddingLeft: '2px', paddingRight: '2px', borderRadius: '2px' }}>{ verb }</span>;
    case 'POST':
      return <span style={{ backgroundColor: '#108EE9', height: '16px', lineHeight: '16px', fontSize: '11px', color: '#FFF', fontWeight: '700', paddingLeft: '2px', paddingRight: '2px', borderRadius: '2px' }}>{ verb }</span>;
    case 'PUT':
      return <span style={{ backgroundColor: '#2DB7F5', height: '16px', lineHeight: '16px', fontSize: '11px', color: '#FFF', fontWeight: '700', paddingLeft: '2px', paddingRight: '2px', borderRadius: '2px' }}>{ verb }</span>;
    default:
      return <span style={{ backgroundColor: '#BFBFBF', height: '16px', lineHeight: '16px', fontSize: '11px', color: '#FFF', fontWeight: '700', paddingLeft: '2px', paddingRight: '2px', borderRadius: '2px' }}>{ verb }</span>
  }
}


function _makeModuleSettingCache() {
  if (!CODE_RESOURCE_CACHE) {
    const cache = {};
    Object.keys(MODULE_SETTINGS).forEach(moduleKey => {
      const moduleSetting = MODULE_SETTINGS[moduleKey];
      cache[moduleKey] = moduleSetting.authority.resources.map(verbUriPattern => {
        const resource = getResourceByVerbUriPattern(verbUriPattern);
        if (resource) {
          return resource;
        } else {
          return {
            unRecognize: true,
            pattern: verbUriPattern,
          }
        }
      });

      moduleSetting.authority.events.forEach(event => {
        cache[`${moduleKey}.${event.code}`] = event.resources.map(verbUriPattern => {
          const resource = getResourceByVerbUriPattern(verbUriPattern);
          if (resource) {
            return resource;
          } else {
            return {
              unRecognize: true,
              pattern: verbUriPattern,
            }
          }
        });
      });
    })

    CODE_RESOURCE_CACHE = cache;

  }
}
